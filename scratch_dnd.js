const fs = require('fs');

// Features
const featureFile = 'features/products/components/feature-editor.tsx';
let featureCode = fs.readFileSync(featureFile, 'utf8');

featureCode = featureCode.replace(
  "import { RiDeleteBinLine, RiAddLine, RiDraggable } from '@remixicon/react'",
  `import { RiDeleteBinLine, RiAddLine, RiDraggable } from '@remixicon/react'\nimport { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'\nimport { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'\nimport { CSS } from '@dnd-kit/utilities'`
);

featureCode = featureCode.replace(
  "export interface Feature {",
  "export interface Feature {\n  _clientId?: string"
);

featureCode = featureCode.replace(
  "const addRow = () => onChange([...value, { feature_text: '' }])",
  "const addRow = () => onChange([...value, { feature_text: '', _clientId: Math.random().toString(36).substr(2, 9) }])"
);

const sortableFeatureRow = `
interface SortableFeatureRowProps {
  feature: Feature;
  index: number;
  updateRow: (i: number, text: string) => void;
  removeRow: (i: number) => void;
}

function SortableFeatureRow({ feature, index, updateRow, removeRow }: SortableFeatureRowProps) {
  const id = feature.id || feature._clientId || index.toString();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-slate-100 rounded">
        <RiDraggable className="h-4 w-4 text-slate-300 flex-shrink-0" />
      </div>
      <span className="text-[#F3BA43] font-bold text-lg leading-none flex-shrink-0">•</span>
      <Input
        placeholder="e.g. High-speed precision spindle"
        value={feature.feature_text}
        onChange={(e) => updateRow(index, e.target.value)}
        className="h-9 text-sm flex-1"
      />
      <IconButton
        aria-label="Remove feature"
        variant="destructive"
        icon={<RiDeleteBinLine className="h-3.5 w-3.5" />}
        className="h-9 w-9 flex-shrink-0"
        onClick={() => removeRow(index)}
      />
    </div>
  );
}
`;

featureCode = featureCode.replace("export function FeatureEditor", sortableFeatureRow + "\nexport function FeatureEditor");

const featureSensors = `  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((f, i) => (f.id || f._clientId || i.toString()) === active.id)
      const newIndex = value.findIndex((f, i) => (f.id || f._clientId || i.toString()) === over.id)
      onChange(arrayMove(value, oldIndex, newIndex))
    }
  }`;

featureCode = featureCode.replace(
  "const updateRow = (index: number, text: string) => {",
  featureSensors + "\n\n  const updateRow = (index: number, text: string) => {"
);

featureCode = featureCode.replace(
  /<div className="space-y-2">[\s\S]*?<\/div>\n\s*<\/div>\n\s*\)}/,
  `<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={value.map((f, i) => f.id || f._clientId || i.toString())} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {value.map((feature, i) => (
                <SortableFeatureRow key={feature.id || feature._clientId || i.toString()} feature={feature} index={i} updateRow={updateRow} removeRow={removeRow} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}`
);

fs.writeFileSync(featureFile, featureCode);

// Specs
const specFile = 'features/products/components/specification-editor.tsx';
let specCode = fs.readFileSync(specFile, 'utf8');

specCode = specCode.replace(
  "import { RiDeleteBinLine, RiAddLine, RiDraggable } from '@remixicon/react'",
  `import { RiDeleteBinLine, RiAddLine, RiDraggable } from '@remixicon/react'\nimport { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'\nimport { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'\nimport { CSS } from '@dnd-kit/utilities'`
);

specCode = specCode.replace(
  "export interface Spec {",
  "export interface Spec {\n  _clientId?: string"
);

specCode = specCode.replace(
  "const addRow = () => onChange([...value, { spec_key: '', spec_value: '' }])",
  "const addRow = () => onChange([...value, { spec_key: '', spec_value: '', _clientId: Math.random().toString(36).substr(2, 9) }])"
);

const sortableSpecRow = `
interface SortableSpecRowProps {
  spec: Spec;
  index: number;
  updateRow: (i: number, field: 'spec_key' | 'spec_value', val: string) => void;
  removeRow: (i: number) => void;
}

function SortableSpecRow({ spec, index, updateRow, removeRow }: SortableSpecRowProps) {
  const id = spec.id || spec._clientId || index.toString();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center mb-2">
      <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-slate-100 rounded">
        <RiDraggable className="h-4 w-4 text-slate-300" />
      </div>
      <Input
        placeholder="e.g. Spindle Speed"
        value={spec.spec_key}
        onChange={(e) => updateRow(index, 'spec_key', e.target.value)}
        className="h-9 text-sm"
      />
      <Input
        placeholder="e.g. 12,000 RPM"
        value={spec.spec_value}
        onChange={(e) => updateRow(index, 'spec_value', e.target.value)}
        className="h-9 text-sm"
      />
      <IconButton
        aria-label="Remove specification"
        variant="destructive"
        icon={<RiDeleteBinLine className="h-3.5 w-3.5" />}
        className="h-9 w-9"
        onClick={() => removeRow(index)}
      />
    </div>
  );
}
`;

specCode = specCode.replace("export function SpecificationEditor", sortableSpecRow + "\nexport function SpecificationEditor");

const specSensors = `  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((s, i) => (s.id || s._clientId || i.toString()) === active.id)
      const newIndex = value.findIndex((s, i) => (s.id || s._clientId || i.toString()) === over.id)
      onChange(arrayMove(value, oldIndex, newIndex))
    }
  }`;

specCode = specCode.replace(
  "const updateRow = (index: number, field: 'spec_key' | 'spec_value', val: string) => {",
  specSensors + "\n\n  const updateRow = (index: number, field: 'spec_key' | 'spec_value', val: string) => {"
);

specCode = specCode.replace(
  /<div className="space-y-2">[\s\S]*?<\/div>\n\s*<\/div>\n\s*\)}/,
  `<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={value.map((s, i) => s.id || s._clientId || i.toString())} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {value.map((spec, i) => (
                <SortableSpecRow key={spec.id || spec._clientId || i.toString()} spec={spec} index={i} updateRow={updateRow} removeRow={removeRow} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}`
);

fs.writeFileSync(specFile, specCode);

// Images
const imgFile = 'features/products/components/product-image-gallery.tsx';
let imgCode = fs.readFileSync(imgFile, 'utf8');

imgCode = imgCode.replace(
  "import { RiDeleteBinLine, RiStarLine, RiStarFill, RiAddLine } from '@remixicon/react'",
  `import { RiDeleteBinLine, RiStarLine, RiStarFill, RiAddLine, RiDraggable } from '@remixicon/react'\nimport { updateProductImageOrder } from '../actions'\nimport { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'\nimport { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'\nimport { CSS } from '@dnd-kit/utilities'`
);

const sortableImageRow = `
interface SortableImageItemProps {
  img: GalleryImage;
  isPrimary: boolean;
  loading: string | null;
  handleSetPrimary: (id: string) => void;
  handleRemove: (imgId: string, mediaId: string) => void;
}

function SortableImageItem({ img, isPrimary, loading, handleSetPrimary, handleRemove }: SortableImageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={\`relative group rounded-xl overflow-hidden border-2 transition-all \${isPrimary ? 'border-[#F3BA43] shadow-md' : 'border-slate-100'}\`}>
      <div {...attributes} {...listeners} className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1.5 rounded-md cursor-grab shadow-sm">
        <RiDraggable className="h-4 w-4 text-slate-600" />
      </div>
      <div className="aspect-square relative bg-slate-50">
        <Image
          src={img.media!.file_url}
          alt={img.media!.alt_text ?? img.media!.file_name}
          fill
          className="object-cover"
          sizes="200px"
        />
      </div>
      {isPrimary && (
        <div className="absolute bottom-2 left-2 bg-[#F3BA43] text-[#324E64] text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
          <RiStarFill className="h-3 w-3" /> Primary
        </div>
      )}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {!isPrimary && (
          <IconButton
            aria-label="Set as primary"
            icon={<RiStarLine className="h-3.5 w-3.5" />}
            className="h-7 w-7 bg-white shadow-sm text-[#F3BA43] hover:text-[#F3BA43]"
            onClick={() => handleSetPrimary(img.media_id)}
            disabled={loading !== null}
          />
        )}
        <IconButton
          aria-label="Remove image"
          variant="destructive"
          icon={<RiDeleteBinLine className="h-3.5 w-3.5" />}
          className="h-7 w-7"
          onClick={() => handleRemove(img.id, img.media_id)}
          disabled={loading !== null}
        />
      </div>
    </div>
  );
}
`;

imgCode = imgCode.replace("export function ProductImageGallery", sortableImageRow + "\nexport function ProductImageGallery");

const imgSensors = `  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id)
      const newIndex = images.findIndex((img) => img.id === over.id)
      const newImages = arrayMove(images, oldIndex, newIndex)
      setImages(newImages)
      
      // Update order in DB
      setLoading('reorder')
      await updateProductImageOrder(productId, newImages.map(img => img.id))
      setLoading(null)
    }
  }`;

imgCode = imgCode.replace(
  "const handleAddImage = async (mediaId: string) => {",
  imgSensors + "\n\n  const handleAddImage = async (mediaId: string) => {"
);

const imgGridRegex = /<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*{\/\* Add image button \*\//;

const replacement = `<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => {
              if (!img.media) return null
              const isPrimary = primaryId === img.media_id
              return (
                <SortableImageItem key={img.id} img={img} isPrimary={isPrimary} loading={loading} handleSetPrimary={handleSetPrimary} handleRemove={handleRemove} />
              )
            })}
            
            {/* Add image button */}`;

imgCode = imgCode.replace(imgGridRegex, replacement);

// The remaining closing tags for DndContext need to be inserted after the add image button.
const closingRegex = /<\/div>\s*<\/div>\s*{images\.length === 0/;
const closingReplacement = `</div>\n        </SortableContext>\n      </DndContext>\n\n      {images.length === 0`;
imgCode = imgCode.replace(closingRegex, closingReplacement);

fs.writeFileSync(imgFile, imgCode);
