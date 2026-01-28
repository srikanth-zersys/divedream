import { Link } from '@inertiajs/react'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SimpleBar from 'simplebar-react'
import i18n from '../../../utils/i18n'
import { interNationalization } from '../../data'
import { InterNationalization } from '../../dtos'
import { AppDispatch, RootState } from '../../slices/reducer'
import { changeLayoutLanguage } from '../../slices/thunk'
import { LAYOUT_LANGUAGES } from '../Constants/layout'
import { Dropdown, DropdownButton, DropdownMenu } from '../CustomComponents/Dropdown/Dropdown'

const LanguageDropdown = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { layoutLanguages } = useSelector((state: RootState) => state.Layout);

  // get country flag
  const getCountryFlag = (code: string) => {
    return interNationalization.find((item) => item.code === code)?.flag;
  }

  // change language
  const changeLanguage = (lng: LAYOUT_LANGUAGES) => {
    dispatch(changeLayoutLanguage(lng));
    i18n.changeLanguage(lng);
  };

  return (
    <React.Fragment>
      <Dropdown position='right' trigger="click" dropdownClassName="dropdown">
        <DropdownButton colorClass='topbar-link'>
          <img src={getCountryFlag(layoutLanguages) || "us" } alt="getCountryFlag(LayoutLanguages)||UsImg"  className="object-cover rounded-full size-6" width={24} height={24} />
        </DropdownButton>

        <DropdownMenu>
          <SimpleBar className="max-h-[calc(100vh_-_100px)]">
            {
              interNationalization && interNationalization.length > 0 && interNationalization.map((value: InterNationalization, key: number) => {
                return (
                  <Link href="#!" className="dropdown-item" key={key} onClick={() => changeLanguage(value.code)}>
                    <img src={value.flag} alt={value.language} className="object-cover rounded-md size-5" width={20} height={20} />
                    <span>{value.language}</span>
                  </Link>
                )
              })
            }
          </SimpleBar>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  )
}

export default LanguageDropdown
