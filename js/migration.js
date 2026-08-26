// LocalStorage to Supabase Migration Service

const MIGRATION_DONE_KEY = 'supabase_migration_completed';

function hasLegacyLocalStorageData() {
  const raw = localStorage.getItem('placementTrackerData');
  return !!raw && !localStorage.getItem(MIGRATION_DONE_KEY);
}

async function migrateLocalStorageToSupabase(userId) {
  if (!supabaseClient || !userId) return false;
  
  const raw = localStorage.getItem('placementTrackerData');
  if (!raw) return false;
  
  let legacyObj;
  try {
    legacyObj = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse legacy storage for migration", e);
    return false;
  }

  try {
    // 1. Migrate Start Date to Profile if provided
    if (legacyObj.settings && legacyObj.settings.startDate) {
      await upsertProfileCloud(userId, currentUser.user_metadata?.name || 'User', legacyObj.settings.startDate);
    }

    // 2. Migrate Tasks
    const taskIdMap = {}; // oldId -> newCloudId
    if (Array.isArray(legacyObj.tasks)) {
      for (const t of legacyObj.tasks) {
        if (!t.deletedDate) {
          const created = await createTaskCloud(userId, t.name, t.category, t.repeat || 'daily');
          if (created) {
            taskIdMap[t.id] = created.id;
          }
        }
      }
    }

    // 3. Migrate Schedules
    const scheduleIdMap = {}; // oldId -> newCloudId
    if (Array.isArray(legacyObj.schedules)) {
      for (const s of legacyObj.schedules) {
        if (!s.deletedDate) {
          const created = await createScheduleCloud(userId, s.activity, s.startTime, s.endTime, s.category, s.repeat || 'daily');
          if (created) {
            scheduleIdMap[s.id] = created.id;
          }
        }
      }
    }

    // 4. Migrate Completions
    if (legacyObj.completions && typeof legacyObj.completions === 'object') {
      for (const [dateStr, dateObj] of Object.entries(legacyObj.completions)) {
        if (dateObj.tasks) {
          for (const [oldTaskId, done] of Object.entries(dateObj.tasks)) {
            if (done && taskIdMap[oldTaskId]) {
              await setCompletionCloud(userId, taskIdMap[oldTaskId], 'task', dateStr, true);
            }
          }
        }
        if (dateObj.schedule) {
          for (const [oldSchId, done] of Object.entries(dateObj.schedule)) {
            if (done && scheduleIdMap[oldSchId]) {
              await setCompletionCloud(userId, scheduleIdMap[oldSchId], 'schedule', dateStr, true);
            }
          }
        }
      }
    }

    // 5. Migrate Daily Notes
    if (legacyObj.notes && typeof legacyObj.notes === 'object') {
      for (const [dateStr, noteObj] of Object.entries(legacyObj.notes)) {
        if (noteObj.wentWell || noteObj.distracted || noteObj.tomorrow) {
          await saveDailyNoteCloud(userId, dateStr, noteObj.wentWell, noteObj.distracted, noteObj.tomorrow);
        }
      }
    }

    // Mark migration as completed
    localStorage.setItem(MIGRATION_DONE_KEY, new Date().toISOString());
    console.log("[Migration] Legacy data successfully migrated to Supabase Cloud!");
    return true;
  } catch (err) {
    console.error("[Migration] Error migrating data to cloud:", err);
    return false;
  }
}
