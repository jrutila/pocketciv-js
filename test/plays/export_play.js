cursor = db.gameLogs.find().sort({$natural: -1}).limit(1)
print(JSON.stringify(cursor.next(), null, "  "))