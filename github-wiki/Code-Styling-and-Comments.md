# Code Styling and Comments

## Code Style: CamelCase

All code follows **camelCase** naming convention consistently throughout the project.

### Examples:

**Variables:**
```javascript
const userId = req.session.userId;
const photoURL = outfit.photoURL;
const styleCategory = geminiData.styleCategory;
```

**Functions:**
```javascript
function getUserOutfits(userId) { ... }
function analyzeImage(imageUri) { ... }
function trackPageView(path) { ... }
```

**Components:**
```javascript
const Dashboard = ({ user }) => { ... }
const Gallery = ({ user }) => { ... }
```

**Constants:**
```javascript
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const API_BASE = `${API_URL}/api`;
```

---

## Code Comments

All code is **fully commented** with:
- File-level documentation
- Function-level documentation
- Inline comments for complex logic
- JSDoc-style comments for functions

### Comment Examples

#### File-Level Comments

```javascript
/**
 * Google Vision API Service
 * Handles image analysis using Google Cloud Vision API
 * 
 * This service provides functions to analyze images and extract:
 * - Labels (clothing items, accessories)
 * - Colors (dominant colors in the image)
 * - Objects (detected objects with bounding boxes)
 * - Text (any text present in the image)
 */
```

#### Function-Level Comments

```javascript
/**
 * Analyze image using Google Vision API
 * @param {string} imageUri - URL or base64 image data
 * @param {boolean} isBase64 - Whether imageUri is base64 encoded
 * @returns {Promise<Object>} Analysis results containing labels, colors, objects, text
 * @throws {Error} If Vision API call fails
 */
const analyzeImage = async (imageUri, isBase64 = false) => {
  // Implementation...
}
```

#### Inline Comments

```javascript
// Extract relevant data from Vision API response
const labels = result.labelAnnotations?.map(label => ({
  description: label.description,
  score: label.score,
  mid: label.mid
})) || [];

// Log API call for analytics
logAPICall('Google Vision API', {
  imageUri: isBase64 ? '[BASE64]' : imageUri,
  features: request.features.map(f => f.type)
}, {
  labelsCount: labels.length,
  colorsCount: colors.length,
  objectsCount: objects.length
}, duration);
```

---

## Code Organization

### Frontend Structure
- **Components**: Reusable UI components
- **Pages**: Route-level page components
- **Utils**: Utility functions (analytics, config)
- **Styles**: Component-specific CSS files

### Backend Structure
- **Routes**: API endpoint handlers
- **Services**: Business logic (Vision, Gemini, Firestore)
- **Middleware**: Request processing (logging, error handling)

---

## Code Quality Standards

- ✅ Consistent indentation (2 spaces)
- ✅ Consistent quote style (single quotes for JS, double for JSON)
- ✅ Meaningful variable names
- ✅ Functions are focused and single-purpose
- ✅ Error handling for all async operations
- ✅ All API calls are logged
- ✅ All user actions are tracked

---

## Example: Well-Commented Code File

See any of the following files for examples of comprehensive commenting:
- `server/services/visionService.js`
- `server/services/geminiService.js`
- `server/services/firestoreService.js`
- `server/routes/analyze.js`
- `client/src/utils/analytics.js`

All files follow the same commenting standards throughout the project.

