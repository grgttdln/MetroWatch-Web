import { supabase } from "./client";

// Database functions
export const db = {
  // Generic select function
  select: async (table, columns = "*", filters = {}) => {
    let query = supabase.from(table).select(columns);

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    return { data, error };
  },

  // Generic insert function
  insert: async (table, data) => {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();
    return { data: result, error };
  },

  // Generic update function
  update: async (table, data, filters = {}) => {
    let query = supabase.from(table).update(data);

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: result, error } = await query.select();
    return { data: result, error };
  },

  // Generic delete function
  delete: async (table, filters = {}) => {
    let query = supabase.from(table).delete();

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    return { data, error };
  },
};

// Real-time subscriptions
export const realtime = {
  // Subscribe to table changes
  subscribe: (table, callback, filters = {}) => {
    let channel = supabase
      .channel(`${table}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
          ...filters,
        },
        callback
      )
      .subscribe();

    return channel;
  },

  // Unsubscribe from channel
  unsubscribe: (channel) => {
    return supabase.removeChannel(channel);
  },
};

// Storage functions
export const storage = {
  // Upload file
  upload: async (bucket, path, file, options = {}) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options);
    return { data, error };
  },

  // Download file
  download: async (bucket, path) => {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    return { data, error };
  },

  // Get public URL
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete file
  remove: async (bucket, paths) => {
    const { data, error } = await supabase.storage.from(bucket).remove(paths);
    return { data, error };
  },
};

// Export the supabase client for direct access if needed
export { supabase };
