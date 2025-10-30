declare module '@/lib/rejectionEmail' {
  export type RejectionEmailPayload = {
    teamName: string;
    teamCode: string;
    recipients: string[];
    feedback?: string;
  };

  export function buildRejectionEmailHtml(teamName: string, teamCode: string, feedback?: string): string;

  export function sendRejectionEmail(payload: RejectionEmailPayload): Promise<void>;
}

declare module '../../../../lib/rejectionEmail' {
  export type RejectionEmailPayload = {
    teamName: string;
    teamCode: string;
    recipients: string[];
    feedback?: string;
  };

  export function buildRejectionEmailHtml(teamName: string, teamCode: string, feedback?: string): string;

  export function sendRejectionEmail(payload: RejectionEmailPayload): Promise<void>;
}
