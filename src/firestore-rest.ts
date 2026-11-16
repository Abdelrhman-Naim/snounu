type Value={stringValue?:string;integerValue?:string;doubleValue?:number;booleanValue?:boolean;nullValue?:null;timestampValue?:string;arrayValue?:{values?:Value[]};mapValue?:{fields?:Record<string,Value>}};
export function decodeValue(v:Value):unknown {
 if('stringValue'in v)return v.stringValue;
 if('integerValue'in v)return Number(v.integerValue);
 if('doubleValue'in v)return v.doubleValue;
 if('booleanValue'in v)return v.booleanValue;
 if('timestampValue'in v)return v.timestampValue;
 if('arrayValue'in v)return(v.arrayValue?.values??[]).map(decodeValue);
 if('mapValue'in v)return Object.fromEntries(Object.entries(v.mapValue?.fields??{}).map(([k,x])=>[k,decodeValue(x)]));
 return null;
}
export function decodeDocument(d:{name:string;fields?:Record<string,Value>}):Record<string,unknown>{return{...Object.fromEntries(Object.entries(d.fields??{}).map(([k,v])=>[k,decodeValue(v)])),id:d.name.split('/').pop()};}
