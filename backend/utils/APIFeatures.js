class APIFeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  filter() {
    const queryObj = { ...this.queryString }

    const excluded = ['page', 'limit', 'sort']
    excluded.forEach(el => delete queryObj[el])

    // price filtering
    if (queryObj.minPrice || queryObj.maxPrice) {
      queryObj.price = {}
      if (queryObj.minPrice) queryObj.price.$gte = Number(queryObj.minPrice)
      if (queryObj.maxPrice) queryObj.price.$lte = Number(queryObj.maxPrice)

      delete queryObj.minPrice
      delete queryObj.maxPrice
    }

    this.query = this.query.find(queryObj)
    return this
  }

  paginate() {
    const page = Number(this.queryString.page) || 1
    const limit = Number(this.queryString.limit) || 10
    const skip = (page - 1) * limit

    this.query = this.query.skip(skip).limit(limit)
    return this
  }
}

module.exports = APIFeatures