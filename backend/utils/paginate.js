/**
 * Server-side pagination helpers with consistent metadata.
 *
 * Metadata shape returned everywhere:
 *   { page, limit, total, totalPages, hasNextPage, hasPrevPage }
 */

// Parse & clamp page/limit from the request query.
function getPaginationParams(query = {}, { defaultLimit = 10, maxLimit = 100 } = {}) {
  let page = parseInt(query.page, 10)
  let limit = parseInt(query.limit, 10)

  if (!Number.isFinite(page) || page < 1) page = 1
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit
  limit = Math.min(limit, maxLimit)

  return { page, limit, skip: (page - 1) * limit }
}

function buildMeta(total, page, limit) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit)
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

/**
 * Paginate a simple Mongoose query (find + count in parallel).
 */
async function paginate(model, {
  filter = {},
  sort = { createdAt: -1 },
  populate,
  select,
  page = 1,
  limit = 10,
  lean = true,
} = {}) {
  const skip = (page - 1) * limit

  let query = model.find(filter).sort(sort).skip(skip).limit(limit)
  if (select) query = query.select(select)
  if (populate) query = query.populate(populate)
  if (lean) query = query.lean()

  const [data, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter),
  ])

  return { data, meta: buildMeta(total, page, limit) }
}

/**
 * Paginate an aggregation pipeline in a SINGLE round-trip using $facet.
 * Pass the pipeline stages BEFORE pagination (match/addFields/sort/etc).
 */
async function paginateAggregate(model, pipeline = [], { page = 1, limit = 10 } = {}) {
  const skip = (page - 1) * limit

  const [result] = await model.aggregate([
    ...pipeline,
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ])

  const data = result?.data || []
  const total = result?.totalCount?.[0]?.count || 0

  return { data, meta: buildMeta(total, page, limit) }
}

module.exports = { getPaginationParams, buildMeta, paginate, paginateAggregate }
