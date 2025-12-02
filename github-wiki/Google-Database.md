# Google Database

## Part 1: Database Setup and Structure

### Database Choice: Google Firestore

We chose **Google Firestore** (Native mode) as our database solution because:
- NoSQL document database - flexible schema for outfit data
- Real-time updates capability
- Scalable and serverless
- Integrated with Google Cloud Platform
- Easy to query and filter
- Automatic indexing

### Database Setup Process

**📸 SCREENSHOT #1 REQUIRED HERE** - Firestore Database Creation

Screenshot showing the Firestore database creation in Google Cloud Console.

**What to show:**
- Google Cloud Console
- Firestore Database page
- Database creation interface
- Native mode selected

**Location**: Google Cloud Console → Firestore → Create Database

---

**📸 SCREENSHOT #2 REQUIRED HERE** - Firestore Database Configuration

Screenshot showing database configuration settings.

**What to show:**
- Database ID
- Location/region selected
- Security rules (if visible)

---

### Database Structure

#### Collection Hierarchy

```
users/
  └── {userId}/
      └── outfits/
          └── {outfitId}/
              ├── photoURL
              ├── styleCategory
              ├── geminiSummary
              ├── topColors
              ├── occasion
              ├── season
              ├── suggestions
              ├── visionTags
              ├── visionLabels
              ├── dominantColors
              ├── objects
              ├── createdAt
              └── updatedAt
```

**📸 SCREENSHOT #3 REQUIRED HERE** - Firestore Collection Structure

Screenshot showing the collection hierarchy in Firestore.

**What to show:**
- `users` collection
- User document with subcollection `outfits`
- Multiple outfit documents
- Field structure visible

---

#### Document Schema

**Outfit Document Structure:**

```json
{
  "photoURL": "https://...",
  "driveFileId": "1a2b3c4d5e6f7g8h",
  "styleCategory": "Casual Chic",
  "geminiSummary": "This outfit features a modern casual style...",
  "topColors": ["Navy Blue", "White", "Beige"],
  "occasion": "Casual",
  "season": "All-Season",
  "suggestions": [
    "Consider adding a statement accessory",
    "Try pairing with neutral shoes"
  ],
  "visionTags": ["Clothing", "Fashion", "Apparel"],
  "visionLabels": [
    {
      "description": "Clothing",
      "score": 0.95
    }
  ],
  "dominantColors": [
    {
      "color": { "red": 30, "green": 50, "blue": 100 },
      "score": 0.85
    }
  ],
  "objects": [
    {
      "name": "Person",
      "score": 0.92
    }
  ],
  "createdAt": "2025-12-02T05:13:25.123Z",
  "updatedAt": "2025-12-02T05:13:25.123Z"
}
```

**📸 SCREENSHOT #4 REQUIRED HERE** - Complete Outfit Document Structure

Screenshot showing a complete outfit document with all fields visible.

**What to show:**
- All fields expanded
- Field names and values
- Data types visible
- Timestamps shown

---

### Database Initialization Code

**Location**: `server/services/firestoreService.js`

The database is initialized using Application Default Credentials (ADC) in production, which automatically uses the Cloud Run service account.

**Key Configuration:**
- Project ID: Set via `GOOGLE_PROJECT_ID` environment variable
- Database ID: Set via `FIRESTORE_DATABASE_ID` environment variable (default: "(default)")
- Credentials: Uses service account attached to Cloud Run

---

## Part 2: Data Operations

### Adding Data to Firestore

#### When Data is Added

Data is added to Firestore when:
1. User analyzes a new outfit photo
2. Analysis completes successfully
3. Results are stored via `firestoreService.storeOutfit()`

**📸 SCREENSHOT #5 REQUIRED HERE** - Adding New Outfit Document

Screenshot showing a new outfit document being created in Firestore.

**What to show:**
- Firestore console
- New document being created
- Fields being populated
- Document ID generated

**How to capture:**
1. Open Firestore console
2. Navigate to `users/{userId}/outfits`
3. Analyze a new outfit in the app
4. Watch the new document appear
5. Take screenshot

---

**📸 SCREENSHOT #6 REQUIRED HERE** - New Document After Analysis

Screenshot showing the newly created document with all analysis data.

**What to show:**
- Complete document structure
- All fields populated
- Style category set
- Colors array populated
- Summary text visible

---

### Updating Data in Firestore

#### When Data is Updated

Data is updated when:
1. User profile information changes
2. Outfit metadata is modified (rare, but possible)

**📸 SCREENSHOT #7 REQUIRED HERE** - Updating Outfit Document

Screenshot showing an outfit document being updated.

**What to show:**
- Document before update
- Fields being modified
- Updated timestamp changing

**Note**: Most operations are create-only. Updates are less common but should be demonstrated if possible.

---

### Removing Data from Firestore

#### When Data is Removed

Data is removed when:
1. User deletes an outfit from their profile
2. User account is deleted (future feature)

**📸 SCREENSHOT #8 REQUIRED HERE** - Deleting Outfit Document

Screenshot showing an outfit document being deleted.

**What to show:**
- Document visible before deletion
- Delete action being performed
- Document removed from collection
- Collection count decreasing

**How to capture:**
1. Go to Profile page in app
2. Delete an outfit
3. Watch Firestore console
4. Document disappears
5. Take screenshot

---

**📸 SCREENSHOT #9 REQUIRED HERE** - Collection After Deletion

Screenshot showing the collection after a document is deleted.

**What to show:**
- Reduced document count
- Remaining documents
- Deleted document no longer visible

---

### Queries Performed from the Application

#### Query 1: Get User's Outfits

**Purpose**: Retrieve all outfits for a specific user

**Query Code Location**: `server/services/firestoreService.js` → `getUserOutfits()`

**Query Details:**
```javascript
db.collection('users').doc(userId).collection('outfits')
  .orderBy('createdAt', 'desc')
  .limit(limit || 100)
  .get()
```

**What it does:**
- Gets all outfits for a user
- Orders by creation date (newest first)
- Limits results (default: 100)

**📸 SCREENSHOT #10 REQUIRED HERE** - Query Results: User Outfits

Screenshot showing the query results in Firestore console or application.

**What to show:**
- Query interface
- Results displayed
- Multiple outfit documents
- Ordered by date

---

#### Query 2: Check if Photo Already Exists

**Purpose**: Prevent duplicate analysis of the same photo

**Query Code Location**: `server/services/firestoreService.js` → `photoExists()`

**Query Details:**
```javascript
db.collection('users').doc(userId).collection('outfits')
  .where('photoURL', '==', photoURL)
  .limit(1)
  .get()
```

**What it does:**
- Checks if a photo URL already exists for the user
- Returns boolean (exists or not)
- Prevents re-analyzing the same photo

**📸 SCREENSHOT #11 REQUIRED HERE** - Query: Check Photo Exists

Screenshot showing the query to check if a photo exists.

**What to show:**
- Query with `where` clause
- Photo URL being checked
- Result (empty if new, document if exists)

---

#### Query 3: Get User Statistics

**Purpose**: Calculate aggregated statistics for dashboard

**Query Code Location**: `server/services/firestoreService.js` → `getUserStats()`

**Query Details:**
```javascript
// Gets all outfits, then processes in memory
db.collection('users').doc(userId).collection('outfits').get()
```

**What it does:**
- Retrieves all user outfits
- Calculates statistics:
  - Total outfits count
  - Style category frequency
  - Color frequency
  - Occasion distribution

**📸 SCREENSHOT #12 REQUIRED HERE** - Query: Get All Outfits for Statistics

Screenshot showing the query to get all outfits for statistics calculation.

**What to show:**
- Query retrieving all documents
- Multiple documents returned
- Data used for statistics

---

#### Query 4: Get Outfit by ID

**Purpose**: Retrieve a specific outfit document

**Query Code Location**: `server/services/firestoreService.js` (implicit in routes)

**Query Details:**
```javascript
db.collection('users').doc(userId).collection('outfits').doc(outfitId).get()
```

**What it does:**
- Gets a single outfit document by ID
- Used when viewing specific outfit details

**📸 SCREENSHOT #13 REQUIRED HERE** - Query: Get Specific Outfit

Screenshot showing a query for a specific outfit document.

**What to show:**
- Document ID in query
- Single document returned
- All fields visible

---

### Query Performance and Indexing

**📸 SCREENSHOT #14 REQUIRED HERE** - Firestore Indexes

Screenshot showing Firestore indexes (if any are created).

**What to show:**
- Indexes page in Firestore console
- Any composite indexes
- Index status

**Note**: Simple queries (single field) don't require composite indexes. If you use complex queries, show the indexes here.

---

### Database Security Rules

**📸 SCREENSHOT #15 REQUIRED HERE** - Firestore Security Rules

Screenshot showing Firestore security rules.

**What to show:**
- Security rules editor
- Rules that restrict access
- User-based access control

**Location**: Firestore Console → Rules

**Example Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/outfits/{outfitId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Note**: Since we're using server-side access with service account, security rules may be less critical, but should still be shown.

---

## Database Operations Summary

### Create Operations
- ✅ **Store Outfit**: When user analyzes a photo
- ✅ **Create User Profile**: On first login (if implemented)

### Read Operations
- ✅ **Get User Outfits**: Retrieve all outfits for dashboard/gallery
- ✅ **Get Specific Outfit**: View individual outfit details
- ✅ **Check Photo Exists**: Prevent duplicate analysis
- ✅ **Get Statistics**: Calculate dashboard statistics

### Update Operations
- ⚠️ **Update Outfit**: Rare, but possible for metadata updates
- ⚠️ **Update User Profile**: If profile editing is implemented

### Delete Operations
- ✅ **Delete Outfit**: When user removes an outfit
- ⚠️ **Delete User Account**: Future feature

---

## Database Usage Statistics

**📸 SCREENSHOT #16 REQUIRED HERE** - Firestore Usage Dashboard

Screenshot showing Firestore usage statistics.

**What to show:**
- Document count
- Storage used
- Read/write operations
- Usage over time

**Location**: Firestore Console → Usage tab

---

## Code References

All database operations are implemented in:
- **Main Service**: `server/services/firestoreService.js`
- **Routes Using Database**: 
  - `server/routes/analyze.js` - Stores analysis results
  - `server/routes/records.js` - Retrieves outfits
  - `server/routes/stats.js` - Gets statistics

---

## Notes

- All database operations are logged in `/logs/analytics-*.log`
- Database uses Application Default Credentials in production
- Development uses service account JSON file
- All queries are optimized with proper indexing
- Data is structured for efficient querying

