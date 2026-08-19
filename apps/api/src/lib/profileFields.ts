interface DbUserProfileRow {
  x_url?: string | null;
  personal_website?: string | null;
  [key: string]: unknown;
}

export function dbRowToApiProfile<T extends DbUserProfileRow>(row: T) {
  const { x_url, personal_website, ...rest } = row;
  return {
    ...rest,
    twitter_url: x_url ?? null,
    website_url: personal_website ?? null,
  };
}

export function apiUpdatesToDbRow(updates: Record<string, unknown>) {
  const dbUpdates: Record<string, unknown> = { ...updates };

  if ('twitter_url' in dbUpdates) {
    dbUpdates.x_url = dbUpdates.twitter_url;
    delete dbUpdates.twitter_url;
  }
  if ('website_url' in dbUpdates) {
    dbUpdates.personal_website = dbUpdates.website_url;
    delete dbUpdates.website_url;
  }

  return dbUpdates;
}
