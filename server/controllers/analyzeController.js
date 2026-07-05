import axios from 'axios';
import FormData from 'form-data';
import MatchResult from '../models/MatchResult.js';
import Resume from '../models/Resume.js';

export const analyzeResume = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Please upload a resume file (PDF or DOCX).' });
    }

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: 'Job description text is required.' });
    }

    // Prepare FormData to send to Python FastAPI service
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    formData.append('job_description', jobDescription.trim());

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

    let mlResponse;
    try {
      mlResponse = await axios.post(`${mlServiceUrl}/analyze`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000,
      });
    } catch (apiErr) {
      console.error('[ML Service Communication Error]:', apiErr.response?.data || apiErr.message);
      const errorMessage = apiErr.response?.data?.detail || 'ML microservice is currently unreachable or failed to process document.';
      return res.status(502).json({ error: errorMessage });
    }

    const {
      match_score,
      matched_skills,
      missing_skills,
      categorized_matched,
      categorized_missing,
      resume_word_count,
      resume_health,
      top_keywords,
      extracted_resume_text,
    } = mlResponse.data;

    // Save Resume metadata & MatchResult to MongoDB (if MongoDB is connected)
    let savedResume = null;
    let savedResult = null;

    try {
      const newResume = new Resume({
        filename: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        extractedText: extracted_resume_text || '',
        userId: req.body.userId || 'guest',
      });
      savedResume = await newResume.save();

      const matchResult = new MatchResult({
        resumeId: savedResume._id,
        filename: file.originalname,
        jobDescription,
        matchScore: match_score,
        matchedSkills: matched_skills,
        missingSkills: missing_skills,
        resumeWordCount: resume_word_count,
        topKeywords: top_keywords,
      });
      savedResult = await matchResult.save();
    } catch (dbErr) {
      console.warn('[MongoDB Notice]: Single analysis persisted in memory mode:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      id: savedResult?._id || 'temp-' + Date.now(),
      filename: file.originalname,
      jobDescription,
      matchScore: match_score,
      matchedSkills: matched_skills,
      missingSkills: missing_skills,
      categorizedMatched: categorized_matched || {},
      categorizedMissing: categorized_missing || {},
      resumeWordCount: resume_word_count,
      resumeHealth: resume_health || null,
      topKeywords: top_keywords,
      createdAt: savedResult?.createdAt || new Date(),
    });
  } catch (error) {
    next(error);
  }
};


export const analyzeBatchResumes = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Please upload at least one candidate resume file.' });
    }

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: 'Job description text is required.' });
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    }
    formData.append('job_description', jobDescription.trim());

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

    let mlResponse;
    try {
      mlResponse = await axios.post(`${mlServiceUrl}/analyze-batch`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000, // 60s timeout for batch
      });
    } catch (apiErr) {
      console.error('[ML Batch Service Error]:', apiErr.response?.data || apiErr.message);
      const errorMessage = apiErr.response?.data?.detail || 'ML microservice failed during batch analysis.';
      return res.status(502).json({ error: errorMessage });
    }

    const { candidates, total_candidates, errors } = mlResponse.data;

    // Persist all candidate results into MongoDB
    for (const cand of candidates) {
      try {
        const newResume = new Resume({
          filename: cand.filename,
          originalName: cand.filename,
          mimeType: 'application/octet-stream',
          extractedText: cand.extracted_resume_text || '',
        });
        const savedResume = await newResume.save();

        const matchResult = new MatchResult({
          resumeId: savedResume._id,
          filename: cand.filename,
          jobDescription,
          matchScore: cand.match_score,
          matchedSkills: cand.matched_skills,
          missingSkills: cand.missing_skills,
          resumeWordCount: cand.resume_word_count,
          topKeywords: cand.top_keywords,
        });
        await matchResult.save();
      } catch (dbErr) {
        // Silent catch for DB offline
      }
    }

    return res.status(200).json({
      success: true,
      totalCandidates: total_candidates,
      candidates,
      errors: errors || [],
    });
  } catch (error) {
    next(error);
  }
};
