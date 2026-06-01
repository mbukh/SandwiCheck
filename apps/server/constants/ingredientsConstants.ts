/*
 * SERVER-ONLY image-pipeline field tables + helpers (the on-disk image variants
 * the server generates per ingredient shape/portion). The ingredient domain
 * vocabulary (TYPE, SHAPE, PORTION, DIETARY_PREFERENCE, isBreadType, …) lives in
 * @sandwicheck/shared — import it from there directly.
 */
import { isBreadType, PORTION, SHAPE } from '@sandwicheck/shared';

// SERVER-ONLY: image-pipeline field tables — do not move to packages/shared.
export const IMAGE_FIELDS = [
  {
    fieldName: 'imageLongDouble',
    title: `shape: ${SHAPE.long}, portion: ${PORTION.double}`,
    suffix: `_${SHAPE.long}_${PORTION.double}`,
  },
  {
    fieldName: 'imageLongFull',
    title: `shape: ${SHAPE.long}, portion: ${PORTION.full}`,
    suffix: `_${SHAPE.long}_${PORTION.full}`,
  },
  {
    fieldName: 'imageLongHalf',
    title: `shape: ${SHAPE.long}, portion: ${PORTION.half}`,
    suffix: `_${SHAPE.long}_${PORTION.half}`,
  },
  {
    fieldName: 'imageRoundDouble',
    title: `shape: ${SHAPE.round}, portion: ${PORTION.double}`,
    suffix: `_${SHAPE.round}_${PORTION.double}`,
  },
  {
    fieldName: 'imageRoundFull',
    title: `shape: ${SHAPE.round}, portion: ${PORTION.full}`,
    suffix: `_${SHAPE.round}_${PORTION.full}`,
  },
  {
    fieldName: 'imageRoundHalf',
    title: `shape: ${SHAPE.round}, portion: ${PORTION.half}`,
    suffix: `_${SHAPE.round}_${PORTION.half}`,
  },
  {
    fieldName: 'imageTrapezoidDouble',
    title: `shape: ${SHAPE.trapezoid}, portion: ${PORTION.double}`,
    suffix: `_${SHAPE.trapezoid}_${PORTION.double}`,
  },
  {
    fieldName: 'imageTrapezoidFull',
    title: `shape: ${SHAPE.trapezoid}, portion: ${PORTION.full}`,
    suffix: `_${SHAPE.trapezoid}_${PORTION.full}`,
  },
  {
    fieldName: 'imageTrapezoidHalf',
    title: `shape: ${SHAPE.trapezoid}, portion: ${PORTION.half}`,
    suffix: `_${SHAPE.trapezoid}_${PORTION.half}`,
  },
];

export const IMAGE_FIELDS_BREAD = [
  {
    fieldName: 'imageBread',
    title: `whole unsliced bread`,
    suffix: ``,
  },
  {
    fieldName: 'imageBreadSliced',
    title: `sliced bread`,
    suffix: `_sliced`,
  },
];

export const ALL_IMAGE_FIELDS = [...IMAGE_FIELDS, ...IMAGE_FIELDS_BREAD];

export const imageFieldsByType = (type: string): { fieldName: string; title: string; suffix: string }[] => {
  return isBreadType(type) ? IMAGE_FIELDS_BREAD : IMAGE_FIELDS;
};
