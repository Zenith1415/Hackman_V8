# Hackman V8 - Frontend Application

A secure, modern web application for managing hackathon registrations, team submissions, and admin operations.

## Features

- 🔒 **Enterprise-grade Security**: Rate limiting, input sanitization, bot protection
- 📝 **Team Registration**: Multi-step registration with email validation
- 📊 **Admin Dashboard**: Comprehensive team management and AI-powered analysis
- 🤖 **AI Analysis**: Gemini-powered project evaluation and duplicate detection
- 📧 **Email Notifications**: Automated confirmation emails
- 🎯 **Team Dashboard**: Project submission and status tracking

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Gmail account for email functionality
- Gemini API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env.local` file in the `frontend` directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/hackman_v8
   
   # Admin Authentication (MUST be 32+ characters)
   ADMIN_TOKEN=<generate-secure-token>
   ADMIN_SELECT_TOKEN=<generate-secure-token>
   
   # Email Configuration
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   EMAIL_SERVER_USER=your_server_email@gmail.com
   EMAIL_SERVER_PASSWORD=your_server_app_password
   
   # AI Features
   GEMINI_API_KEY=your_gemini_api_key
   ```

   **Generate secure tokens:**
   ```bash
   # Generate ADMIN_TOKEN
   openssl rand -base64 48
   
   # Generate ADMIN_SELECT_TOKEN
   openssl rand -base64 48
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3000/admin

## Security

This application implements comprehensive security measures including:

- ✅ IP-based rate limiting (prevents DDoS)
- ✅ Input sanitization (prevents NoSQL injection)
- ✅ Bot detection and blocking
- ✅ Request size validation
- ✅ Security headers (XSS, clickjacking protection)
- ✅ Token-based admin authentication
- ✅ Email validation and sanitization

**For detailed security information, see [SECURITY.md](./SECURITY.md)**

### Rate Limits

| Route | Limit | Window |
|-------|-------|--------|
| Registration | 5 requests | 1 hour |
| Contact Form | 3 requests | 15 minutes |
| Team Access | 30 requests | 15 minutes |
| Admin Routes | 100 requests | 15 minutes |
| AI Analysis | 50 requests | 1 hour |

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin endpoints (protected)
│   │   │   ├── registration/  # Registration endpoint
│   │   │   ├── contact/       # Contact form endpoint
│   │   │   └── team/          # Team endpoints
│   │   ├── admin/             # Admin pages
│   │   ├── dashboard/         # Team dashboard
│   │   └── registration/      # Registration page
│   ├── components/            # React components
│   ├── lib/                   # Utility libraries
│   │   ├── rateLimit.ts      # Rate limiting middleware
│   │   ├── security.ts       # Security utilities
│   │   ├── dbConnect.ts      # Database connection
│   │   └── errorUtils.ts     # Error handling
│   ├── models/                # Mongoose models
│   └── types/                 # TypeScript types
├── public/                    # Static assets
├── SECURITY.md               # Security documentation
└── package.json
```

## API Endpoints

### Public Endpoints

- `POST /api/registration` - Team registration
- `POST /api/contact` - Contact form submission
- `GET /api/team/[teamCode]` - Get team details
- `PUT /api/team/[teamCode]` - Update team details
- `POST /api/team/[teamCode]/submit` - Submit project
- `GET /api/team/lead` - Team lead login

### Admin Endpoints (Require Authentication)

- `GET /api/admin/registrations` - List all registrations
- `PUT /api/admin/registrations/[id]` - Update registration
- `DELETE /api/admin/registrations/[id]` - Delete registration
- `PUT /api/admin/registrations/[id]/selection` - Update selection status
- `GET /api/admin/team/[teamCode]` - Get team by code
- `PUT /api/admin/team/[teamCode]` - Update team by code
- `POST /api/admin/analyze/[teamCode]` - AI analysis

## Development

### Running Tests

```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### Environment Variables

Ensure all environment variables are set in your hosting platform:

1. **Vercel/Netlify**: Add environment variables in dashboard
2. **Docker**: Use `.env` file or docker-compose
3. **Traditional hosting**: Set in system environment

### Security Checklist

- [ ] All environment variables are set
- [ ] Admin tokens are 48+ characters long
- [ ] HTTPS is enabled
- [ ] MongoDB has authentication enabled
- [ ] Email credentials are app-specific passwords
- [ ] Rate limits are appropriate for your traffic
- [ ] Error messages don't leak sensitive information

### Post-Deployment

1. Test all endpoints with production URLs
2. Verify rate limiting is working
3. Test admin authentication
4. Check email delivery
5. Monitor logs for errors
6. Set up error tracking (Sentry, etc.)

## Monitoring

### Important Metrics

- **429 responses**: Rate limit violations (potential attack)
- **401 responses**: Failed authentication attempts
- **403 responses**: Blocked bots or security violations
- **500 responses**: Server errors (needs investigation)

### Logs to Monitor

```bash
# Rate limit violations
grep "Too many requests" logs/*.log

# Failed auth attempts
grep "Unauthorized" logs/*.log

# Bot blocks
grep "Suspicious user agent" logs/*.log
```

## Common Issues

### Rate Limiting Too Strict

Edit `src/lib/rateLimit.ts` and adjust the limits:

```typescript
export const rateLimitConfigs = {
  registration: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10, // Increase from 5
  },
  // ... other configs
};
```

### Email Not Sending

1. Ensure 2FA is enabled on Gmail
2. Generate App-Specific Password
3. Use the app password, not your Gmail password
4. Check email credentials in `.env.local`

### MongoDB Connection Issues

1. Check `MONGODB_URI` format
2. Ensure MongoDB is running
3. Verify network access (for MongoDB Atlas)
4. Check database user permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions:
- Create an issue on GitHub
- Contact the development team
- See [SECURITY.md](./SECURITY.md) for security issues

## Acknowledgments

- Next.js 15
- MongoDB & Mongoose
- Google Gemini AI
- Zod for validation
- Nodemailer for emails

