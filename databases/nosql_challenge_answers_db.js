// Create collections
db.createCollection("users")
db.createCollection("products")
db.createCollection("transactions")

// Insert sample data
db.users.insertOne({ name: "Jane Doe", email: "jane@example.com", password: "hashed_password" })
db.products.insertOne({ name: "Laptop", description: "15-inch screen", price: 799.99, listerUserId: ObjectId("janeUserId") })
db.transactions.insertOne({ buyerId: ObjectId("johnUserId"), productId: ObjectId("laptopId"), date: new ISODate(), quantity: 1 })

// Create index on the 'name' field of the 'users' collection
db.users.createIndex({ email: 1 }, { unique: true })

// Aggregation example to count products listed by each user
db.products.aggregate([
  { $group: { _id: "$listerUserId", numberOfProducts: { $sum: 1 } } }
])

// Advanced query examples
// 1. Find all products listed by a specific user
db.products.find({ listerUserId: ObjectId("specificUserId") })

// 2. Find the total amount spent by a specific user (simplified example)
db.transactions.aggregate([
  { $match: { buyerId: ObjectId("specificUserId") } },
  {
    $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "_id",
      as: "productDetails"
    }
  },
  { $unwind: "$productDetails" },
  { $group: { _id: "$buyerId", totalSpent: { $sum: { $multiply: ["$quantity", "$productDetails.price"] } } } }
])

// 3. Find the top 5 most popular products
db.transactions.aggregate([
  { $group: { _id: "$productId", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 5 },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "productDetails"
    }
  },
  { $unwind: "$productDetails" },
  { $project: { productName: "$productDetails.name", count: 1 } }
])
