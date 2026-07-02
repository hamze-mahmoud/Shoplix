const User = require('../../models/User')

// GET /api/admin/users — users enriched with order count + total spent,
// ranked by spend (top customers first). Single aggregation.
module.exports = async function getAllUsers(req, res) {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          let: { uid: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$uid'] },
                    { $ne: ['$status', 'cancelled'] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                spent: { $sum: { $ifNull: ['$totalPrice', 0] } },
                lastOrder: { $max: '$createdAt' },
              },
            },
          ],
          as: 'stats',
        },
      },
      {
        $addFields: {
          orderCount: { $ifNull: [{ $arrayElemAt: ['$stats.count', 0] }, 0] },
          totalSpent: { $ifNull: [{ $arrayElemAt: ['$stats.spent', 0] }, 0] },
          lastOrder: { $arrayElemAt: ['$stats.lastOrder', 0] },
        },
      },
      { $project: { passwordHash: 0, stats: 0, __v: 0 } },
      { $sort: { totalSpent: -1, createdAt: -1 } },
    ])

    res.json(users)
  } catch (err) {
    console.error('getAllUsers error', err)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}
