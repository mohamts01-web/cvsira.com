// Only an explicitly verified application destination from the job projection enables email.
// Emails occurring in descriptions, company contacts or user-entered fields are not evidence.
export function confirmedApplicationEmail(job) {
  if(job?.applicationMethod!=="email"||job?.applicationEmailConfirmed!==true)return null;
  const email=job.applicationEmail;
  return typeof email==="string"&&email.length<=254&&/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)?email:null;
}
