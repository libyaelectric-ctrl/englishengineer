import { EmailTemplate } from './work-tools.types';

export type BaseEmailTemplate = Omit<EmailTemplate, 'category' | 'subject' | 'tags'>;

const email = (
  id: string,
  title: string,
  subject: string,
  request: string,
  technicalDetail: string,
  explanation: string
): BaseEmailTemplate => ({
  id,
  title,
  shortVersion: `Subject: ${subject}\n\nHello,\n\n${request}\n\nRegards,`,
  professionalVersion: `Subject: ${subject}\n\nDear Team,\n\n${request} Please confirm the responsible person and target date.\n\nKind regards,`,
  politeVersion: `Subject: ${subject}\n\nDear Team,\n\nCould you please ${request.charAt(0).toLowerCase()}${request.slice(1)} Your support in confirming the next action would be appreciated.\n\nKind regards,`,
  technicalVersion: `Subject: ${subject}\n\nDear Team,\n\n${request}\n\nTechnical reference: ${technicalDetail}\n\nPlease respond with supporting records and the committed completion date.\n\nKind regards,`,
  turkishExplanation: explanation,
});

export const BASE_EMAIL_TEMPLATES: BaseEmailTemplate[] = [
  email(
    'delay-email',
    'Delay Email',
    'Notice of delivery delay',
    'The approved cable delivery is delayed and now affects the planned installation sequence.',
    'Approved programme activity EL-230 and required-on-site date',
    'Gecikmeyi etkisi ve program referansiyla bildirir.'
  ),
  email(
    'inspection-request',
    'Inspection Request',
    'Request for inspection - Area B',
    'The installation is complete and ready for inspection tomorrow at 10:00.',
    'Approved ITP witness point and latest coordinated drawing',
    'Hazirlik durumu, yer ve saat bilgisi verir.'
  ),
  email(
    'approval-request',
    'Approval Request',
    'Approval required - revised layout',
    'Please review and approve the attached revised equipment layout to avoid impact on procurement.',
    'Revision cloud, equipment clearances and interface schedule',
    'Onayin neden acil oldugunu teknik etkiyle aciklar.'
  ),
  email(
    'meeting-invitation',
    'Meeting Invitation',
    'Coordination meeting - electrical interfaces',
    'Please attend a 30-minute coordination meeting on Tuesday at 09:30 to close the listed interface actions.',
    'Agenda, open-action register and coordinated model views',
    'Toplanti amacini, suresini ve beklenen kapanışları belirtir.'
  ),
  email(
    'procurement-email',
    'Procurement Follow-up',
    'Urgent status - ATS panels',
    'Please confirm manufacturing progress, inspection date and ex-works delivery date for the ATS panels.',
    'Purchase order, approved submittal and delivery schedule',
    'Tedarik durumunu somut kilometre taslariyla sorar.'
  ),
  email(
    'submittal-reply',
    'Submittal Reply',
    'Material submittal revision response',
    'The revised submittal addresses all technical comments and includes the requested compliance documents.',
    'Comment-response sheet and certificate index',
    'Revizyonun yorumlari nasil kapattigini bildirir.'
  ),
  email(
    'ncr-email',
    'NCR Response',
    'Response to NCR-014',
    'The affected work is controlled, corrective action is underway and reinspection is requested for tomorrow.',
    'Corrective-action record and approved method statement',
    'Uygunsuzluk cevabini kontrollu ve kanıtlı tutar.'
  ),
  email(
    'consultant-clarification',
    'Consultant Clarification',
    'Technical clarification required',
    'Please clarify the required interface point because the drawing and specification indicate different termination locations.',
    'Drawing reference, specification clause and marked-up detail',
    'Celisen dokumanlari tarafsiz bicimde netleştirir.'
  ),
  email(
    'handover-email',
    'Handover Email',
    'Handover dossier submission',
    'The updated handover dossier is attached for review, including as-built drawings, test records and O&M manuals.',
    'Document register and outstanding-item list',
    'Teslim dosyasinin kapsam ve aciklarini bildirir.'
  ),
  email(
    'warning-email',
    'Warning Email',
    'Immediate action required - access obstruction',
    'The access obstruction must be removed today because it prevents safe inspection and maintenance.',
    'Approved access zone and HSE observation reference',
    'Uyariyi profesyonel, gerekceli ve tarihli yazar.'
  ),
  email(
    'contractor-instruction',
    'Contractor Instruction',
    'Instruction - revise support installation',
    'Revise the support installation in the identified area before continuing adjacent works.',
    'Approved detail, inspection comment and hold point',
    'Talimat kapsam, referans ve devam kosulunu netleştirir.'
  ),
];
