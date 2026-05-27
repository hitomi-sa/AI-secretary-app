import { google } from 'googleapis'
import type { CalendarToken, CalendarEventInput } from '@/types/calendar'

const SCOPES = ['https://www.googleapis.com/auth/calendar']
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/calendar/auth/callback`

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  )
}

export function getAuthUrl(userId: string): string {
  const oauth2Client = getOAuth2Client()
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state: userId,
  })
}

export async function getTokenFromCode(code: string): Promise<CalendarToken> {
  const oauth2Client = getOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return {
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token ?? null,
    expiry_date: tokens.expiry_date ?? null,
  }
}

export async function refreshAccessToken(token: CalendarToken): Promise<CalendarToken> {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: token.access_token,
    refresh_token: token.refresh_token ?? undefined,
    expiry_date: token.expiry_date ?? undefined,
  })
  const { credentials } = await oauth2Client.refreshAccessToken()
  return {
    access_token: credentials.access_token!,
    refresh_token: credentials.refresh_token ?? token.refresh_token,
    expiry_date: credentials.expiry_date ?? null,
  }
}

function buildAuthClient(token: CalendarToken) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: token.access_token,
    refresh_token: token.refresh_token ?? undefined,
    expiry_date: token.expiry_date ?? undefined,
  })
  return oauth2Client
}

export async function listGoogleEvents(
  token: CalendarToken,
  timeMin: string,
  timeMax: string
) {
  const auth = buildAuthClient(token)
  const calendar = google.calendar({ version: 'v3', auth })
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 2500,
  })
  return res.data.items ?? []
}

export async function createGoogleEvent(
  token: CalendarToken,
  event: CalendarEventInput
) {
  const auth = buildAuthClient(token)
  const calendar = google.calendar({ version: 'v3', auth })
  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: event.title,
      description: event.description ?? undefined,
      location: event.location ?? undefined,
      start: event.is_all_day
        ? { date: event.start_time.slice(0, 10) }
        : { dateTime: event.start_time },
      end: event.is_all_day
        ? { date: event.end_time.slice(0, 10) }
        : { dateTime: event.end_time },
      colorId: event.color ?? undefined,
    },
  })
  return res.data
}

export async function updateGoogleEvent(
  token: CalendarToken,
  googleEventId: string,
  event: CalendarEventInput
) {
  const auth = buildAuthClient(token)
  const calendar = google.calendar({ version: 'v3', auth })
  const res = await calendar.events.update({
    calendarId: 'primary',
    eventId: googleEventId,
    requestBody: {
      summary: event.title,
      description: event.description ?? undefined,
      location: event.location ?? undefined,
      start: event.is_all_day
        ? { date: event.start_time.slice(0, 10) }
        : { dateTime: event.start_time },
      end: event.is_all_day
        ? { date: event.end_time.slice(0, 10) }
        : { dateTime: event.end_time },
      colorId: event.color ?? undefined,
    },
  })
  return res.data
}

export async function deleteGoogleEvent(
  token: CalendarToken,
  googleEventId: string
) {
  const auth = buildAuthClient(token)
  const calendar = google.calendar({ version: 'v3', auth })
  await calendar.events.delete({
    calendarId: 'primary',
    eventId: googleEventId,
  })
}
