### Firebase Setup Instructions
1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com).
   - Click “Add project,” name it (e.g., “FlySphere”).
   - Disable Google Analytics (optional), create project.
   - Select the Spark Plan (free).

2. **Configure Authentication**:
   - In Firebase Console, go to `Authentication` > `Sign-in method`.
   - Enable “Email/Password.”
   - Optionally enable Google or others for OAuth.

3. **Set Up Firestore**:
   - Go to `Firestore Database` > `Create database`.
   - Choose “Start in test mode” (temporary; we’ll secure later).
   - Select a region (e.g., `us-central`).

4. **Get Firebase Config**:
   - Go to `Project settings` > `General`.
   - Under “Your apps,” click `</>` to add a web app.
   - Register app (name: “FlySphere”).
   - Copy the `firebaseConfig` object:
     ```javascript
     const firebaseConfig = {
       apiKey: "...",
       authDomain: "...",
       projectId: "...",
       storageBucket: "...",
       messagingSenderId: "...",
       appId: "..."
     };
     ```
   - Paste it into `staff-portal.html` (replace placeholder).

5. **Secure Firestore**:
   - In `Firestore Database` > `Rules`, replace test mode rules with:
     ```firestore
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{userId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
         match /schedules/{scheduleId} {
           allow read: if request.auth != null;
           allow create: if request.auth != null;
           allow update, delete: if request.auth != null && resource.data.createdBy == request.auth.uid;
         }
         match /events/{eventId} {
           allow read: if request.auth != null;
           allow create: if request.auth != null;
           allow update, delete: if request.auth != null && resource.data.createdBy == request.auth.uid;
         }
       }
     }
     ```
   - Publish rules. This ensures:
     - Only authenticated users read/write their user data.
     - Anyone logged in can read/create schedules/events.
     - Only creators (or admins, via code) can edit/delete.

6. **Set Admin Roles**:
   - After signing up a user (e.g., via `Sign Up` button), go to Firestore > `users` collection.
   - Find the user’s document (ID matches their `uid`).
   - Edit `role` field to `admin` for admin privileges.

### Implementation Instructions
1. **Replace Files**:
   - Overwrite `staff-portal.html`, `index.html`, and `css/styles.css` with the provided code.
   - Back up existing files.

2. **Update Firebase Config**:
   - Insert your `firebaseConfig` in `staff-portal.html`.

3. **Add data.json to Repository**:
   - Create a `data` folder in your GitHub repository.
   - Add an initial `data.json` file with:
     ```json
     {
       "schedules": [],
       "events": []
     }
     ```
   - Commit and push to ensure it’s accessible at `https://www.flysphere.cloud/data/data.json`.

4. **Test Locally**:
   - Run a local server: `python -m http.server`.
   - Test:
     - `http://localhost:8000/index.html`
     - `http://localhost:8000/staff-portal.html`
   - **Authentication**:
     - Click “Sign Up” with a test email/password (e.g., `test@flysphere.cloud`, `password123`).
     - Log in with the same credentials.
     - Expected: Login shows tables; logout shows login form.
     - Check Console: “Logged in: test@flysphere.cloud”, “Auth state changed: test@flysphere.cloud”.
   - **Real-Time Sync**:
     - Log in on two browsers (e.g., Chrome, Firefox).
     - In Chrome (admin):
       - Set user as admin in Firestore (`role: 'admin'`).
       - Add schedule (“John”, “2025-04-20”, “10:00”, “Flight Check”).
       - Add event (“Meeting”, “2025-04-21”, “14:00”, “HQ”).
     - In Firefox:
       - Expected: Tables update instantly with new schedule/event.
       - Check “Syncing…” changes to “Synced”.
     - Edit/delete as admin in Chrome; verify Firefox updates.
     - Check Console: “Schedule added: {...}”, “Event added: {...}”.
   - **Navigation**:
     - Verify hero scroll on `index.html` (full hero visible).
     - Confirm hamburger menu closes on link click (mobile).
   - **Errors**:
     - Test invalid login: Expect error message.
     - Test empty fields: Expect alert.

5. **Deploy to GitHub Pages**:
   - Commit changes to your repository.
   - Push to the GitHub Pages branch (e.g., `main`).
   - Verify at:
     - `https://www.flysphere.cloud/`
     - `https://www.flysphere.cloud/staff-portal.html`

6. **Usage Notes**:
   - **Authentication**:
     - Users sign up with email/password.
     - Manually set `role: 'admin'` in Firestore for admin access.
     - Passwords are secure (Firebase hashes them).
   - **Sync**:
     - Events/schedules update in real-time across all logged-in users.
     - “Syncing…” shows during initial load; “Synced” confirms data loaded.
   - **Admin**:
     - Only admins see edit/delete buttons (based on `role`).
     - Non-admins can view/add but not modify others’ entries.
   - **Debugging**:
     - Check Console for auth/data logs.
     - In Firebase Console, monitor Firestore usage (stay under 50K reads/day).
     - If sync fails, verify Firestore rules and network.

### Security Notes
- **Firebase Config**: Exposing `firebaseConfig` in client-side code is safe (Firebase uses security rules).
- **Firestore Rules**: Current rules allow authenticated reads/creates, restricted updates/deletes. Tighten if needed (e.g., admin-only creates).
- **Users**: Sign-up creates `staff` users. Manually assign `admin` roles to prevent unauthorized access.
- **Backup**: Export Firestore data periodically (Firebase Console) in case of accidental deletion.

### Comparison to Other Alternatives
- **Supabase**: Similar to Firebase (PostgreSQL, real-time, auth). Free tier is generous, but setup is nearly identical. Firebase’s ecosystem is more mature.
- **PocketBase**: Needs server hosting (not possible on GitHub Pages alone). Great for self-hosted setups.
- **Export/Import**: Simpler, no external accounts, but manual and less secure. Firebase wins for automation.

### Additional Notes
- **Cost**: Spark Plan is free forever for low traffic. Monitor usage in Firebase Console to avoid unexpected upgrades (unlikely).
- **Fallback**: Keep `data.json` export/import as a backup (re-add buttons if needed).
- **Enhancements**:
  - Add Google login: Enable in Firebase Auth, update `login()` with `signInWithPopup`.
  - User management UI: Add a section for admins to set roles (I can implement).
- **Troubleshooting**:
  - If auth fails: Check email/password, Firebase Auth settings.
  - If sync lags: Verify Firestore rules, network, or listener errors in Console.
  - Share Console logs or Firebase errors for quick fixes.

If you prefer the export/import workaround or another alternative (e.g., Supabase), I can pivot to that. For Firebase, confirm you’re okay with the setup steps, and I’ll guide further if needed. Let me know your thoughts or any specific tweaks!