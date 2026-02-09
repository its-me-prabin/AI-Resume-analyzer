# AI Resume Analyzer

🔗 **Live Demo:** [https://ai-resume_analyzer.puter.site/](https://ai-resume_analyzer.puter.site/)

A comprehensive React 18 application that analyzes resumes against job descriptions using AI. The app converts PDF resumes to images, extracts text, and sends everything to Puter AI for detailed ATS (Applicant Tracking System) analysis. Results are stored in Puter's cloud storage with full persistence.

## Features

- **Puter Authentication**: Secure sign-in with Puter to enable AI and cloud storage
- **PDF Processing**: Convert PDFs to images and extract text using pdfjs-dist
- **AI-Powered Analysis**: Comprehensive ATS scoring with job description matching
- **JSON-Only Responses**: Strict schema validation for reliable AI outputs
- **Cloud Storage**: Persist analyses, images, and files to Puter storage
- **Resume History**: View, manage, and delete past analyses from real storage
- **Job Description Matching**: Compare resumes against specific job postings
- **Visual Feedback**: Loading states, error handling, and reusable components
- **Feedback System**: Built-in feedback page with multiple categories

## Tech Stack

- **React 18** - Modern React with hooks and strict mode
- **React Router v6** - Client-side routing
- **Vite** - Fast build tooling and dev server
- **Tailwind CSS** - Utility-first styling
- **CSS Modules** - Component-scoped styles
- **pdfjs-dist** - PDF to image conversion and text extraction
- **Puter.js** - Authentication, AI chat, and cloud storage

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` to view the app.

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Deployment to Puter

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Go to [puter.com](https://puter.com)** and sign in

3. **Drag and drop** the entire `dist` folder from your local machine into the Puter file manager
   - Or right-click in Puter → "Upload Here"

4. **Right-click** on the uploaded `dist` folder and select **"Publish as Website"**

5. **Choose a subdomain** (e.g., `resume-analyzer`) and click **Publish**

6. Your app is now live at `https://<your-subdomain>.puter.site`

> **Note:** To update the app, rebuild locally and re-upload the `dist` folder to replace the existing files.

## Usage

1. **Connect Puter**: Click "Connect Puter" to sign in and enable AI + storage features

2. **Upload Resume**: Select a PDF resume file (text-searchable PDFs work best)

3. **Add Job Description**: Paste a job description for better matching analysis (optional)

4. **Generate Report**: Click "Generate AI Report" to get comprehensive ATS analysis

5. **Review Results**: View ATS scores, skills matching, missing keywords, and recommendations

6. **Manage History**: View past analyses on the home page, delete individual reports, or wipe all data

## AI Analysis Output

The AI provides a structured JSON response with:

- **ATS Score** (0-100): Overall resume quality score
- **Match Percentage** (0-100): How well the resume matches the job description
- **Summary**: Brief assessment of the candidate
- **Strengths**: Key positive aspects of the resume
- **Weaknesses**: Areas needing improvement
- **Missing Keywords**: Important terms from the job description not found
- **Skills Match**: Matched and missing skills breakdown
- **Section Scores**: Individual scoring for resume sections
- **Formatting Issues**: ATS compatibility problems
- **Recommendations**: Actionable improvement suggestions

## Storage Structure

When connected to Puter, files are stored at:

```
/AI-Resume-Analyzer/
  └── <resume-name>-<timestamp>/
      ├── page-1.png
      ├── page-2.png
      ├── ...
      ├── resume.pdf
      └── analysis.json
```

Feedback is stored at:
```
/AI-Resume-Analyzer/feedback/
  └── <timestamp>.json
```

## Environment Variables

No environment variables are required. The app uses Puter's built-in `window.puter` global.

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires JavaScript to be enabled and supports modern ES2020+ features.

## Troubleshooting

### AI Analysis Fails
- Ensure you're signed in to Puter
- Check that your PDF is text-searchable (not just scanned images)
- Try with a smaller PDF or fewer pages

### Storage Issues
- Verify you're signed in to Puter
- Check browser console for Puter API errors
- Try clearing local storage and signing in again

### PDF Won't Upload
- Ensure the file is a valid PDF
- Check that the file size isn't too large (>10MB may cause issues)
- Try converting the PDF if it's password protected

## Development

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx
│   ├── Button.module.css
│   ├── Card.jsx
│   ├── Card.module.css
│   ├── ErrorState.jsx
│   ├── ErrorState.module.css
│   ├── FeedbackBanner.jsx
│   ├── FeedbackBanner.module.css
│   ├── LoadingState.jsx
│   └── LoadingState.module.css
├── pages/              # Route components
│   ├── Home.jsx
│   ├── Analyzer.jsx
│   └── Feedback.jsx
├── services/           # External service integrations
│   ├── puter.js
│   └── storage.js
├── utils/              # Helper utilities
│   └── pdf.js
├── App.jsx
├── main.jsx
└── index.css
```

### Adding New Features

1. Create components in `src/components/`
2. Use CSS modules for component styles
3. Add new routes in `App.jsx`
4. Update Puter service functions as needed

## License

MIT License - feel free to use and modify as needed.

## Contributing

Feedback and contributions are welcome! Use the in-app feedback form or submit issues via GitHub.
