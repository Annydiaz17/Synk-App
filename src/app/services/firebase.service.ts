import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import {
  getRemoteConfig,
  fetchAndActivate,
  getValue,
  RemoteConfig,
} from 'firebase/remote-config';
import { environment } from '../../environments/environment';

/**
 * Firebase Remote Config Service
 *
 * Uses the Firebase JS SDK directly (not AngularFire) for maximum
 * compatibility with Angular 20+. Provides a reactive BehaviorSubject
 * for the `show_priority_feature` feature flag.
 *
 * If Firebase is not configured (placeholder keys), the service
 * gracefully defaults `show_priority_feature` to false.
 */
@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private app: FirebaseApp | null = null;
  private remoteConfig: RemoteConfig | null = null;

  /** Feature flag: show/hide priority field on tasks */
  private readonly showPrioritySubject = new BehaviorSubject<boolean>(false);
  readonly showPriorityFeature$ = this.showPrioritySubject.asObservable();

  constructor() {
    this.initFirebase();
  }

  /** Initialize Firebase and fetch Remote Config */
  private async initFirebase(): Promise<void> {
    try {
      const config = environment.firebaseConfig;

      // Skip if placeholder config detected
      if (!config || config.apiKey === 'TU_API_KEY_AQUI' || config.apiKey === '') {
        console.warn(
          '[FirebaseService] Firebase no configurado. ' +
          'El campo de prioridad estará oculto por defecto. ' +
          'Configura tu Firebase en environment.ts para habilitarlo.'
        );
        return;
      }

      // Initialize only once
      if (getApps().length === 0) {
        this.app = initializeApp(config);
      } else {
        this.app = getApps()[0];
      }

      this.remoteConfig = getRemoteConfig(this.app);

      // Set defaults and minimum fetch interval
      this.remoteConfig.defaultConfig = {
        show_priority_feature: false,
      };
      this.remoteConfig.settings.minimumFetchIntervalMillis =
        environment.production ? 3600000 : 30000; // 1 hour in prod, 30s in dev

      // Fetch and activate
      await fetchAndActivate(this.remoteConfig);

      const showPriority = getValue(this.remoteConfig, 'show_priority_feature').asBoolean();
      this.showPrioritySubject.next(showPriority);

      console.log('[FirebaseService] Remote Config loaded. show_priority_feature =', showPriority);
    } catch (error) {
      console.warn('[FirebaseService] Error initializing Firebase Remote Config:', error);
      // Keep default (false) — app works fine without Firebase
      this.showPrioritySubject.next(false);
    }
  }

  /** Manually refresh Remote Config */
  async refreshConfig(): Promise<void> {
    if (!this.remoteConfig) { return; }
    try {
      await fetchAndActivate(this.remoteConfig);
      const showPriority = getValue(this.remoteConfig, 'show_priority_feature').asBoolean();
      this.showPrioritySubject.next(showPriority);
    } catch (error) {
      console.warn('[FirebaseService] Error refreshing config:', error);
    }
  }
}
