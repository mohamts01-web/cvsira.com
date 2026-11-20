// Display/contact data only. Never use this user-editable metadata for permissions.
/** @returns {Record<string,string>} */
export function cleanPersonalProfile(input){
  if(!input || typeof input!=="object" || Array.isArray(input))throw Error("بيانات الملف غير صالحة.");
  const limits={name:120,headline:180,phone:40,city:100,country:100,contactEmail:254,linkedin:300,bio:1200};
  const result={};
  for(const [field,limit] of Object.entries(limits)){
    const value=input[field] ?? "";
    if(typeof value!=="string" || value.length>limit)throw Error("راجع طول بيانات الملف الشخصي.");
    result[field]=value.trim();
  }
  if(result.contactEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.contactEmail))throw Error("اكتب بريد تواصل صالحًا.");
  if(result.linkedin){
    let url;try{url=new URL(result.linkedin);}catch{throw Error("اكتب رابط LinkedIn كاملًا.");}
    if(url.protocol!=="https:"||url.username||url.password||!/(^|\.)linkedin\.com$/i.test(url.hostname))throw Error("استخدم رابطًا آمنًا من LinkedIn.");
  }
  return result;
}

export async function savePersonalProfile(client,owner,profile){
  const values=cleanPersonalProfile(profile);
  const current=await client.auth.getUser();
  if(current.error || current.data.user?.id!==owner)throw Error("انتهت جلستك. سجّل الدخول مجددًا لحفظ بياناتك.");
  const result=await client.auth.updateUser({data:{elmam_profile:values}});
  if(result.error)throw result.error;
  if(result.data.user?.id!==owner)throw Error("تعذّر تأكيد حفظ الملف.");
  return values;
}
