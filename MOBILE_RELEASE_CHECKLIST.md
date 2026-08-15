# PaceRun Club Mobile Testing and Play Store Checklist

## 1. Test as an installable mobile app first

1. Run the local app:
   ```bash
   npm run dev -- --host 0.0.0.0
   ```
2. Open the network URL on your Android phone while connected to the same Wi-Fi.
3. In Chrome, open the menu and choose **Install app** if the in-app install button is unavailable.
4. Open PaceRun Club from the phone home screen.
5. Go to **More > Mobile app testing** and run:
   - Install app
   - Test GPS
   - Test offline

## 2. Feature test before Play Store

- Start run: distance, time, pace, average speed, and max speed update.
- Stop & save: run appears in Proof/history.
- Goals: selected distance changes run progress.
- Area: join a nearby running community.
- Profile: save name, area, goal, level, and privacy.
- Connect: request nearby runner connection.
- Settings: test voice, battery, night mode, live location, language.
- Offline: app shell opens after first load.

## 3. Android Play Store route

For Play Store, wrap this web app as a native Android app using one of these:

- Capacitor Android app
- Trusted Web Activity
- Native Android WebView shell

Recommended for first version: **Capacitor**, because it can later add real GPS background tracking, notifications, and storage.

## 4. Play Store internal testing

Before public release:

1. Create a signed Android release build.
2. Upload to Google Play Console.
3. Use **Internal testing** first.
4. Add your own Gmail as tester.
5. Install from the internal testing link.
6. Test GPS outdoors, route saving, app restart, offline launch, and battery behavior.

## 5. Privacy text needed

Use clear permission copy:

"PaceRun Club records location only after you tap Start Run. Tracking stops when you tap Stop & Save. Location is used to calculate route, distance, pace, speed, and run proof. The app never silently tracks location."
