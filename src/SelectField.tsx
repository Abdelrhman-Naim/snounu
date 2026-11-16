import * as Select from '@radix-ui/react-select';
import {Check,ChevronDown,ChevronUp} from 'lucide-react';
import './select.css';
type Props={label:string;value:string;onValueChange:(value:string)=>void;options:readonly {value:string;label:string;disabled?:boolean}[];name?:string;placeholder?:string;disabled?:boolean;required?:boolean};
export default function SelectField({label,value,onValueChange,options,name,placeholder='اختر…',disabled=false,required=false}:Props){
 return <Select.Root dir="rtl" name={name} value={value} onValueChange={onValueChange} disabled={disabled} required={required}>
  <Select.Trigger className="ui-select-trigger" aria-label={label} aria-required={required}><Select.Value placeholder={placeholder}/><Select.Icon asChild><ChevronDown size={18}/></Select.Icon></Select.Trigger>
  <Select.Portal><Select.Content className="ui-select-content" position="popper" sideOffset={6} collisionPadding={12} align="start">
   <Select.ScrollUpButton className="ui-select-scroll"><ChevronUp size={17}/></Select.ScrollUpButton>
   <Select.Viewport className="ui-select-viewport">{options.map(option=><Select.Item className="ui-select-item" key={option.value} value={option.value} disabled={option.disabled}><Select.ItemText>{option.label}</Select.ItemText><Select.ItemIndicator className="ui-select-check"><Check size={16}/></Select.ItemIndicator></Select.Item>)}</Select.Viewport>
   <Select.ScrollDownButton className="ui-select-scroll"><ChevronDown size={17}/></Select.ScrollDownButton>
  </Select.Content></Select.Portal>
 </Select.Root>;
}
