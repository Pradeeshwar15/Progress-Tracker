// Supabase Data Access Layer

// Profile operations
async function getProfileCloud(userId) {
  if (!supabaseClient || !userId) return null;
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching profile:", error);
  }
  return data;
}

async function upsertProfileCloud(userId, name, startDate) {
  if (!supabaseClient || !userId) return null;
  const payload = {
    id: userId,
    name: name,
    updated_at: new Date().toISOString()
  };
  if (startDate) payload.start_date = startDate;

  const { data, error } = await supabaseClient
    .from('profiles')
    .upsert(payload)
    .select()
    .single();

  if (error) console.error("Error upserting profile:", error);
  return data;
}

// Task operations
async function fetchTasksCloud(userId) {
  if (!supabaseClient || !userId) return [];
  const { data, error } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) console.error("Error fetching tasks:", error);
  return data || [];
}

async function createTaskCloud(userId, title, category, repeatType) {
  if (!supabaseClient || !userId) return null;
  const { data, error } = await supabaseClient
    .from('tasks')
    .insert({
      user_id: userId,
      title: title,
      category: category || 'Placement',
      repeat_type: repeatType || 'daily'
    })
    .select()
    .single();
  if (error) console.error("Error creating task:", error);
  return data;
}

async function updateTaskCloud(taskId, updates) {
  if (!supabaseClient) return null;
  const payload = { ...updates, updated_at: new Date().toISOString() };
  const { data, error } = await supabaseClient
    .from('tasks')
    .update(payload)
    .eq('id', taskId)
    .select()
    .single();
  if (error) console.error("Error updating task:", error);
  return data;
}

async function deleteTaskCloud(taskId) {
  if (!supabaseClient) return false;
  const { error } = await supabaseClient
    .from('tasks')
    .delete()
    .eq('id', taskId);
  if (error) console.error("Error deleting task:", error);
  return !error;
}

// Schedule operations
async function fetchSchedulesCloud(userId) {
  if (!supabaseClient || !userId) return [];
  const { data, error } = await supabaseClient
    .from('schedules')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: true });
  if (error) console.error("Error fetching schedules:", error);
  return data || [];
}

async function createScheduleCloud(userId, title, startTime, endTime, category, repeatType) {
  if (!supabaseClient || !userId) return null;
  const { data, error } = await supabaseClient
    .from('schedules')
    .insert({
      user_id: userId,
      title: title,
      start_time: startTime,
      end_time: endTime || null,
      category: category || 'Placement',
      repeat_type: repeatType || 'daily'
    })
    .select()
    .single();
  if (error) console.error("Error creating schedule:", error);
  return data;
}

async function updateScheduleCloud(scheduleId, updates) {
  if (!supabaseClient) return null;
  const payload = { ...updates, updated_at: new Date().toISOString() };
  const { data, error } = await supabaseClient
    .from('schedules')
    .update(payload)
    .eq('id', scheduleId)
    .select()
    .single();
  if (error) console.error("Error updating schedule:", error);
  return data;
}

async function deleteScheduleCloud(scheduleId) {
  if (!supabaseClient) return false;
  const { error } = await supabaseClient
    .from('schedules')
    .delete()
    .eq('id', scheduleId);
  if (error) console.error("Error deleting schedule:", error);
  return !error;
}

// Completion operations
async function fetchCompletionsCloud(userId, dateStr) {
  if (!supabaseClient || !userId) return [];
  let query = supabaseClient.from('completions').select('*').eq('user_id', userId);
  if (dateStr) query = query.eq('date', dateStr);
  const { data, error } = await query;
  if (error) console.error("Error fetching completions:", error);
  return data || [];
}

async function setCompletionCloud(userId, itemId, itemType, dateStr, isCompleted) {
  if (!supabaseClient || !userId) return null;
  if (isCompleted) {
    const { data, error } = await supabaseClient
      .from('completions')
      .upsert({
        user_id: userId,
        item_id: itemId,
        item_type: itemType,
        date: dateStr,
        completed: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,item_id,item_type,date' })
      .select();
    if (error) console.error("Error setting completion:", error);
    return data;
  } else {
    const { error } = await supabaseClient
      .from('completions')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .eq('date', dateStr);
    if (error) console.error("Error removing completion:", error);
    return null;
  }
}

// Daily Notes operations
async function fetchDailyNoteCloud(userId, dateStr) {
  if (!supabaseClient || !userId) return null;
  const { data, error } = await supabaseClient
    .from('daily_notes')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .single();
  if (error && error.code !== 'PGRST116') console.error("Error fetching daily note:", error);
  return data;
}

async function saveDailyNoteCloud(userId, dateStr, wentWell, distraction, tomorrowPriority) {
  if (!supabaseClient || !userId) return null;
  const { data, error } = await supabaseClient
    .from('daily_notes')
    .upsert({
      user_id: userId,
      date: dateStr,
      went_well: wentWell || '',
      distraction: distraction || '',
      tomorrow_priority: tomorrowPriority || '',
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,date' })
    .select()
    .single();
  if (error) console.error("Error saving daily note:", error);
  return data;
}
