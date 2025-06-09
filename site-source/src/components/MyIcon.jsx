import React from 'react';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as LuIcons from "react-icons/lu";
import * as SiIcons from "react-icons/si";
import * as BiIcons from "react-icons/bi";


const iconSets = {
  fa: FaIcons,
  md: MdIcons,
  lu: LuIcons,
  si: SiIcons,
  bi: BiIcons,
};

const MyIcon = ({ name, set = 'fa', size = 24, color = 'currentColor', className = '' }) => {
  const IconComponent = iconSets[set][name];

  if (!IconComponent) {
    console.warn(`Icon ${name} from set ${set} not found`);
    return null;
  }

  return <IconComponent size={size} color={color} className={className} />;
};

export default MyIcon;
