import React, { useState } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronUp, Printer, Info } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  category: 'essential' | 'recommended' | 'optional';
  notes?: string;
}

interface WhatToBringChecklistProps {
  productType: 'discover_scuba' | 'fun_dive' | 'course' | 'snorkeling' | 'boat_trip' | 'night_dive' | 'default';
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const checklistsByType: Record<string, ChecklistItem[]> = {
  discover_scuba: [
    { id: 'swimsuit', text: 'Swimsuit/Boardshorts', category: 'essential' },
    { id: 'towel', text: 'Towel', category: 'essential' },
    { id: 'sunscreen', text: 'Reef-safe sunscreen', category: 'essential', notes: 'Apply before arriving' },
    { id: 'water', text: 'Water bottle', category: 'essential', notes: 'Stay hydrated!' },
    { id: 'certification', text: 'ID/Passport', category: 'essential' },
    { id: 'change', text: 'Change of clothes', category: 'recommended' },
    { id: 'camera', text: 'Underwater camera (optional)', category: 'optional' },
    { id: 'snacks', text: 'Light snacks', category: 'optional' },
  ],
  fun_dive: [
    { id: 'cert_card', text: 'Certification card', category: 'essential', notes: 'Physical or digital' },
    { id: 'logbook', text: 'Dive logbook', category: 'essential' },
    { id: 'swimsuit', text: 'Swimsuit/Boardshorts', category: 'essential' },
    { id: 'towel', text: 'Towel', category: 'essential' },
    { id: 'sunscreen', text: 'Reef-safe sunscreen', category: 'essential' },
    { id: 'water', text: 'Water bottle', category: 'essential' },
    { id: 'own_gear', text: 'Personal dive gear (if any)', category: 'recommended', notes: 'Mask, fins, wetsuit' },
    { id: 'dive_computer', text: 'Dive computer (if owned)', category: 'recommended' },
    { id: 'camera', text: 'Underwater camera', category: 'optional' },
    { id: 'change', text: 'Change of clothes', category: 'recommended' },
  ],
  course: [
    { id: 'cert_card', text: 'Existing certification (if any)', category: 'essential' },
    { id: 'id', text: 'ID/Passport', category: 'essential' },
    { id: 'medical_form', text: 'Completed medical form', category: 'essential', notes: 'Provided by dive center' },
    { id: 'photos', text: 'Passport photos (2)', category: 'essential', notes: 'For certification card' },
    { id: 'swimsuit', text: 'Swimsuit/Boardshorts', category: 'essential' },
    { id: 'towel', text: 'Towel', category: 'essential' },
    { id: 'notebook', text: 'Notebook & pen', category: 'recommended' },
    { id: 'sunscreen', text: 'Reef-safe sunscreen', category: 'essential' },
    { id: 'water', text: 'Water bottle', category: 'essential' },
    { id: 'lunch', text: 'Lunch/snacks', category: 'recommended', notes: 'For full-day courses' },
  ],
  snorkeling: [
    { id: 'swimsuit', text: 'Swimsuit/Boardshorts', category: 'essential' },
    { id: 'towel', text: 'Towel', category: 'essential' },
    { id: 'sunscreen', text: 'Reef-safe sunscreen', category: 'essential' },
    { id: 'hat', text: 'Hat/Cap', category: 'recommended' },
    { id: 'sunglasses', text: 'Sunglasses', category: 'recommended' },
    { id: 'water', text: 'Water bottle', category: 'essential' },
    { id: 'rashguard', text: 'Rash guard/T-shirt', category: 'recommended', notes: 'Sun protection' },
    { id: 'camera', text: 'Waterproof camera', category: 'optional' },
  ],
  boat_trip: [
    { id: 'seasick', text: 'Motion sickness medication', category: 'recommended', notes: 'Take 30min before' },
    { id: 'swimsuit', text: 'Swimsuit/Boardshorts', category: 'essential' },
    { id: 'towel', text: 'Towel (2 recommended)', category: 'essential' },
    { id: 'sunscreen', text: 'Reef-safe sunscreen', category: 'essential' },
    { id: 'hat', text: 'Hat/Cap', category: 'essential' },
    { id: 'sunglasses', text: 'Sunglasses (with strap)', category: 'recommended' },
    { id: 'water', text: 'Water bottle', category: 'essential' },
    { id: 'snacks', text: 'Light snacks', category: 'recommended' },
    { id: 'jacket', text: 'Light jacket/windbreaker', category: 'recommended' },
    { id: 'drybag', text: 'Dry bag for electronics', category: 'recommended' },
  ],
  night_dive: [
    { id: 'cert_card', text: 'Certification card', category: 'essential' },
    { id: 'logbook', text: 'Dive logbook', category: 'essential' },
    { id: 'flashlight', text: 'Backup flashlight', category: 'recommended', notes: 'Primary provided' },
    { id: 'warm_clothes', text: 'Warm clothes for after', category: 'essential' },
    { id: 'towel', text: 'Towel', category: 'essential' },
    { id: 'water', text: 'Water bottle', category: 'essential' },
    { id: 'snacks', text: 'Snacks', category: 'recommended' },
  ],
  default: [
    { id: 'swimsuit', text: 'Swimsuit/Boardshorts', category: 'essential' },
    { id: 'towel', text: 'Towel', category: 'essential' },
    { id: 'sunscreen', text: 'Reef-safe sunscreen', category: 'essential' },
    { id: 'water', text: 'Water bottle', category: 'essential' },
    { id: 'change', text: 'Change of clothes', category: 'recommended' },
  ],
};

const WhatToBringChecklist: React.FC<WhatToBringChecklistProps> = ({
  productType,
  className = '',
  collapsible = true,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const items = checklistsByType[productType] || checklistsByType.default;

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const handlePrint = () => {
    window.print();
  };

  const essentialItems = items.filter(i => i.category === 'essential');
  const recommendedItems = items.filter(i => i.category === 'recommended');
  const optionalItems = items.filter(i => i.category === 'optional');

  const progress = Math.round((checkedItems.size / items.length) * 100);

  const renderItem = (item: ChecklistItem) => (
    <label
      key={item.id}
      className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
    >
      <button
        onClick={() => toggleItem(item.id)}
        className="mt-0.5 flex-shrink-0"
      >
        {checkedItems.has(item.id) ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
        )}
      </button>
      <div className="flex-1">
        <span className={`text-sm ${checkedItems.has(item.id) ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
          {item.text}
        </span>
        {item.notes && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {item.notes}
          </p>
        )}
      </div>
    </label>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 ${collapsible ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''}`}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎒</div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">What to Bring</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {checkedItems.size}/{items.length} items packed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {collapsible && (
            isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Essential */}
          {essentialItems.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-2">
                Essential
              </h4>
              <div className="space-y-1">
                {essentialItems.map(renderItem)}
              </div>
            </div>
          )}

          {/* Recommended */}
          {recommendedItems.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-2">
                Recommended
              </h4>
              <div className="space-y-1">
                {recommendedItems.map(renderItem)}
              </div>
            </div>
          )}

          {/* Optional */}
          {optionalItems.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Optional
              </h4>
              <div className="space-y-1">
                {optionalItems.map(renderItem)}
              </div>
            </div>
          )}

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors print:hidden"
          >
            <Printer className="w-4 h-4" />
            Print Checklist
          </button>
        </div>
      )}
    </div>
  );
};

export default WhatToBringChecklist;
