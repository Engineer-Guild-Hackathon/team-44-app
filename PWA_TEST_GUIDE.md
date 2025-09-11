# PWA Testing Guide - Libraria

This guide helps you test the PWA (Progressive Web App) functionality on iPhone and Android devices.

## PWA Features Implemented

### ✅ Core PWA Requirements
- **Web App Manifest**: `/web/public/manifest.json` with proper configuration
- **Service Worker**: `/web/public/sw.js` with caching and offline support  
- **HTTPS/Secure Context**: Required for PWA (works on localhost for development)
- **Icons**: Multiple sizes for different devices and use cases
- **PWA Metadata**: Enhanced meta tags for iOS and Android support

### ✅ Installation Features
- **Add to Home Screen**: Supported on both iOS Safari and Android Chrome
- **Standalone Display**: App opens in full-screen mode without browser UI
- **Custom Install Prompt**: Browser-native install prompts when criteria are met
- **App-like Experience**: Custom splash screen, app icons, and theming

## Testing Instructions

### iPhone Safari Testing

1. **Open the App**
   - Navigate to your deployed app URL in Safari
   - Ensure you're using Safari (not Chrome or other browsers)

2. **Add to Home Screen**
   - Tap the Share button (square with arrow pointing up)
   - Scroll down and tap "Add to Home Screen"
   - Customize the name if needed, then tap "Add"

3. **Launch from Home Screen**
   - Find the Libraria app icon on your home screen
   - Tap to launch - it should open in standalone mode (no Safari browser UI)
   - The status bar should match the app's theme color

4. **Verify Standalone Mode**
   - App should fill the entire screen
   - No Safari browser interface visible
   - App icon should appear in iOS app switcher

### Android Chrome Testing

1. **Open the App**
   - Navigate to your deployed app URL in Chrome
   - Chrome may automatically show an install banner

2. **Install the App**
   - Method 1: Tap the install banner if it appears
   - Method 2: Tap Chrome menu (⋮) → "Add to Home screen" or "Install app"
   - Method 3: Look for install icon in the address bar

3. **Launch from Home Screen**
   - Find the Libraria app icon on your home screen or app drawer
   - Tap to launch - it should open as a standalone app
   - Should not show Chrome browser interface

4. **Verify Installation**
   - App appears in Android's installed apps list
   - Can be found in app drawer
   - Behaves like a native app

### What to Look For

#### ✅ Successful PWA Installation Indicators
- App icon appears on home screen with proper branding
- App launches in standalone mode (no browser UI)
- Custom splash screen shows during launch
- App feels like a native mobile application
- Status bar color matches app theme (#C4A676)
- App can be found in device's app management settings

#### ❌ Issues to Report
- App opens in browser instead of standalone mode
- Missing or incorrect app icon
- Browser interface visible when launched from home screen
- Installation option not available in browser menu

## Technical Details

### Service Worker Features
- **Caching Strategy**: Network-first with fallback to cache
- **Offline Support**: Basic offline functionality for cached resources
- **Push Notifications**: Infrastructure ready for future implementation
- **Auto-Updates**: Service worker updates automatically

### Manifest Configuration
```json
{
  "name": "Libraria - あなたの知識の図書館",
  "short_name": "Libraria", 
  "display": "standalone",
  "theme_color": "#C4A676",
  "background_color": "#FAFAF9"
}
```

### iOS-Specific Features
- Apple Touch Icons for home screen
- Apple Web App meta tags for standalone mode
- Custom status bar styling
- Mobile web app capability flags

## Troubleshooting

### Installation Not Available
- Ensure using HTTPS (or localhost for development)
- Verify manifest.json is accessible at `/manifest.json`
- Check that service worker is registered successfully
- Try refreshing the page and waiting a few seconds

### App Opens in Browser
- Clear browser cache and try again
- Verify manifest.json has `"display": "standalone"`
- Check that all PWA criteria are met
- Re-add to home screen if previously installed

### Missing Icons
- Verify icons exist in `/public/icons/` directory
- Check manifest.json icon references are correct
- Ensure icons are properly sized and formatted

## Browser DevTools Testing

### Check PWA Status (Chrome DevTools)
1. Open DevTools (F12)
2. Go to "Application" tab
3. Check "Manifest" section for errors
4. Check "Service Workers" section for registration status
5. Use "Lighthouse" tab to run PWA audit

### Verify Installation Criteria
All of these should be ✅:
- [ ] Served over HTTPS (or localhost)
- [ ] Has a valid web app manifest
- [ ] Has a registered service worker
- [ ] Has appropriate icons
- [ ] Passes engagement heuristics (varies by browser)

## Next Steps

After confirming PWA functionality works on both platforms:

1. **User Experience Testing**
   - Test app navigation in standalone mode
   - Verify all features work without browser interface
   - Check performance and loading times

2. **Push Notifications** (Future Enhancement)
   - Implement Firebase Cloud Messaging
   - Test notification display and interaction
   - Verify notification actions work correctly

3. **Offline Experience** (Future Enhancement)
   - Implement offline-first data caching
   - Add offline indicator UI
   - Test functionality without internet connection

## Support

If you encounter issues during testing:
1. Check browser console for errors
2. Verify all files are accessible (manifest.json, sw.js, icons)
3. Test on different devices and browsers
4. Use browser DevTools PWA audit for detailed analysis