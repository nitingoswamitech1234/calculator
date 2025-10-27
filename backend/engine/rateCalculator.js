/**
 * order: object with dimensions, quantity, flags, optionally paper_weight_per_box, area_per_box_sqft
 * masterRates: object with paper_rate, printing_rate, lamination_rate, corrugation_rate, pasting_rate, pinning_rate, transport_charge
 *
 * RETURNS: { totalCost, perBox, area_per_box_sqft, paper_weight_per_box }
 */

export function calculateBoxRate(order, masterRates) {
  const q = order.quantity || 1;

  // compute area (surface area where printing/lamination/corrugation applies)
  // assume L x W is top area, area for printing or lamination often is outer surface (approx)
  // Here compute face area in sqft: convert mm/cm/inch to sqft based on size_unit
  function toFeet(val, unit) {
    if (!val) return 0;
    if (unit === 'mm') return val / 304.8;      // mm to feet
    if (unit === 'cm') return val / 30.48;      // cm to feet
    if (unit === 'inch') return val / 12;       // inch to feet
    return val; // assume already feet
  }

  const unit = order.size_unit || 'mm';
  const L_ft = toFeet(order.length, unit);
  const W_ft = toFeet(order.width, unit);
  const H_ft = toFeet(order.height, unit);

  const topArea = L_ft * W_ft;          // sqft top
  const sideArea = 2 * (L_ft * H_ft + W_ft * H_ft); // sides
  const totalSurface = topArea + sideArea; // sqft approx for printing/lamination/corrugation

  // paper weight per box: if provided use it, else approximate using area * gsm
  // convert GSM to kg per sqft: GSM (g/m2). 1 sqft = 0.092903 m2.
  let paperWeightKg = order.paper_weight_per_box || 0;
  if (!paperWeightKg && order.paper_gsm) {
    const gsm = order.paper_gsm;
    // area in m2 = totalSurface sqft * 0.092903
    const area_m2 = totalSurface * 0.092903;
    // weight in grams = gsm * area_m2
    const grams = gsm * area_m2;
    paperWeightKg = grams / 1000.0;
  }

  // now costs
  let total = 0;

  if (order.include_paper) {
    const paperRate = masterRates.paper_rate || 0; // could be ₹/kg or ₹/sheet (we assume per kg primarily)
    // if masterRates indicates per_sheet, frontend should pass paperWeightPerBox as 1 sheet weight etc.
    total += paperRate * paperWeightKg;
  }

  if (order.include_printing) {
    const printingRate = masterRates.printing_rate || 0; // ₹ per sqft
    total += printingRate * totalSurface;
  }

  if (order.include_lamination) {
    const lamRate = masterRates.lamination_rate || 0;
    total += lamRate * totalSurface;
  }

  if (order.include_corrugation) {
    const corrRate = masterRates.corrugation_rate || 0;
    total += corrRate * totalSurface;
  }

  if (order.include_pasting) {
    total += (masterRates.pasting_rate || 0) * q;
  }

  if (order.include_pinning) {
    total += (masterRates.pinning_rate || 0) * q;
  }

  if (order.include_transport) {
    total += (masterRates.transport_charge || 0);
  }

  const perBox = (q > 0) ? total / q : total;

  return {
    totalCost: parseFloat(total.toFixed(2)),
    perBox: parseFloat(perBox.toFixed(2)),
    area_per_box_sqft: parseFloat(totalSurface.toFixed(4)),
    paper_weight_per_box: parseFloat(paperWeightKg.toFixed(4))
  };
}
