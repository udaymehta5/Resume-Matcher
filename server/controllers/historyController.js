import MatchResult from '../models/MatchResult.js';

export const getHistory = async (req, res, next) => {
  try {
    const history = await MatchResult.find()
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    // If DB is offline, return graceful empty history array
    console.warn('[MongoDB History Notice]: Database unavailable, returning empty history.', error.message);
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
      notice: 'Database connection offline',
    });
  }
};

export const getHistoryById = async (req, res, next) => {
  try {
    const item = await MatchResult.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Analysis result not found.' });
    }
    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHistoryItem = async (req, res, next) => {
  try {
    const item = await MatchResult.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'History item deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
