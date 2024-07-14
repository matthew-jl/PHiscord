import React, { useEffect, useState } from 'react';
import { useFontSize } from '@/components/providers/font-size-provider';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { RiArrowDropDownLine, RiFontSize2 } from 'react-icons/ri';

const FontSizeSelector = () => {
  const { fontSizeClass, setFontSizeClass } = useFontSize();
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    if (fontSizeClass) {
      setSelectedSize(fontSizeClass);
    }
  }, [fontSizeClass]);

  const handleFontSizeChange = (value: string) => {
    setFontSizeClass(value);
    setSelectedSize(value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className='bg-dc-900 rounded-full w-12 h-12 flex justify-center items-center hover:bg-dc-800'>
          <RiFontSize2 size={20}/>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side='right'>
        <DropdownMenuCheckboxItem
          onClick={() => handleFontSizeChange('font-scale-small')}
          checked={selectedSize === 'font-scale-small'}
        >
          Small
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          onClick={() => handleFontSizeChange('')}
          checked={selectedSize === ''}
        >
          Default
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          onClick={() => handleFontSizeChange('font-scale-large')}
          checked={selectedSize === 'font-scale-large'}
        >
          Large
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FontSizeSelector;
