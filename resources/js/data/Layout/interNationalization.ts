import cn from '../../../../public/assets/images/flag/cn.svg';
import de from '../../../../public/assets/images/flag/de.svg';
import es from '../../../../public/assets/images/flag/es.svg';
import fr from '../../../../public/assets/images/flag/fr.svg';
import il from '../../../../public/assets/images/flag/il.svg';
import it from '../../../../public/assets/images/flag/it.svg';
import kr from '../../../../public/assets/images/flag/kr.svg';
import nl from '../../../../public/assets/images/flag/nl.svg';
import pt from '../../../../public/assets/images/flag/pt.svg';
import ru from '../../../../public/assets/images/flag/ru.svg';
import sa from '../../../../public/assets/images/flag/sa.svg';
import tr from '../../../../public/assets/images/flag/tr.svg';
import us from '../../../../public/assets/images/flag/us.svg';
import vn from '../../../../public/assets/images/flag/vn.svg';
import { LAYOUT_LANGUAGES } from "../../components/Constants/layout";
import { InterNationalization } from "../../dtos";


const interNationalization: InterNationalization[] = [
    {
        id: 1,
        language: 'English',
        code: LAYOUT_LANGUAGES.ENGLISH,
        flag: us,
    },
    {
        id: 2,
        language: 'Spanish',
        code: LAYOUT_LANGUAGES.SPANISH,
        flag: es,
    },
    {
        id: 3,
        language: 'French',
        code: LAYOUT_LANGUAGES.FRENCH,
        flag: fr,
    },
    {
        id: 4,
        language: 'Russian',
        code: LAYOUT_LANGUAGES.RUSSIAN,
        flag: ru,
    },
    {
        id: 5,
        language: 'German',
        code: LAYOUT_LANGUAGES.GERMAN,
        flag: de,
    },
    {
        id: 6,
        language: 'Italian',
        code: LAYOUT_LANGUAGES.ITALIAN,
        flag: it,
    },
    {
        id: 7,
        language: 'Chinese',
        code: LAYOUT_LANGUAGES.CHINESE,
        flag: cn,
    },
    {
        id: 8,
        language: 'Arabic',
        code: LAYOUT_LANGUAGES.ARABIC,
        flag: sa,
    },
    {
        id: 9,
        language: 'Turkish',
        code: LAYOUT_LANGUAGES.TURKISH,
        flag: tr,
    },
    {
        id: 10,
        language: 'Hebrew',
        code: LAYOUT_LANGUAGES.HEBREW,
        flag: il,
    },
    {
        id: 11,
        language: 'Vietnamese',
        code: LAYOUT_LANGUAGES.VIETNAMESE,
        flag: vn,
    },
    {
        id: 12,
        language: 'Dutch',
        code: LAYOUT_LANGUAGES.DUTCH,
        flag: nl,
    },
    {
        id: 13,
        language: 'Korean',
        code: LAYOUT_LANGUAGES.KOREAN,
        flag: kr,
    },
    {
        id: 14,
        language: 'Portuguese',
        code: LAYOUT_LANGUAGES.PORTUGUESE,
        flag: pt,
    }
];

export { interNationalization };
