import React, { useState } from 'react';
import type { FootprintData } from '../utils/types';
import { calculateEmissions } from '../utils/formulas';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Zap, Car, Utensils, Trash2, ArrowLeft, ArrowRight, Save, Info } from 'lucide-react';

interface FootprintCalculatorProps {
  currentInputs: FootprintData;
  onSave: (data: FootprintData) => void;
  onCancel: () => void;
}

type Step = 'energy' | 'transport' | 'food' | 'waste';

export const FootprintCalculator: React.FC<FootprintCalculatorProps> = ({
  currentInputs,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FootprintData>(currentInputs);
  const [activeStep, setActiveStep] = useState<Step>('energy');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps: { id: Step; label: string; icon: typeof Zap }[] = [
    { id: 'energy', label: 'Home Energy', icon: Zap },
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'food', label: 'Food & Diet', icon: Utensils },
    { id: 'waste', label: 'Waste Habits', icon: Trash2 },
  ];

  // Live calculation of current values
  const liveEmissions = calculateEmissions(formData);

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 'energy') {
      if (formData.energy.electricity < 0) newErrors.electricity = 'Electricity cannot be negative';
      if (formData.energy.gas < 0) newErrors.gas = 'Natural gas cannot be negative';
      if (formData.energy.water < 0) newErrors.water = 'Water usage cannot be negative';
    }

    if (step === 'transport') {
      if (formData.transport.carKm < 0) newErrors.carKm = 'Car mileage cannot be negative';
      if (formData.transport.transitHours < 0) newErrors.transitHours = 'Transit hours cannot be negative';
      if (formData.transport.flightsShort < 0) newErrors.flightsShort = 'Short flights count cannot be negative';
      if (formData.transport.flightsLong < 0) newErrors.flightsLong = 'Long flights count cannot be negative';
    }

    if (step === 'food') {
      if (formData.food.localRatio < 0 || formData.food.localRatio > 100) {
        newErrors.localRatio = 'Local food ratio must be between 0% and 100%';
      }
    }

    if (step === 'waste') {
      if (formData.waste.bags < 0) newErrors.bags = 'Garbage bags count cannot be negative';
      if (formData.waste.recycleRatio < 0 || formData.waste.recycleRatio > 100) {
        newErrors.recycleRatio = 'Recycling ratio must be between 0% and 100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(activeStep)) return;

    const currentIndex = steps.findIndex((s) => s.id === activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    const currentIndex = steps.findIndex((s) => s.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(activeStep)) return;

    // Check all steps before saving
    let isValid = true;
    for (const step of steps) {
      if (!validateStep(step.id)) {
        setActiveStep(step.id);
        isValid = false;
        break;
      }
    }

    if (isValid) {
      onSave(formData);
    }
  };

  const updateEnergy = (field: keyof typeof formData.energy, value: string) => {
    const numVal = value === '' ? 0 : parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      energy: { ...prev.energy, [field]: numVal },
    }));
    if (errors[field]) setErrors((prev) => { const c = { ...prev }; delete c[field]; return c; });
  };

  const updateTransport = (field: keyof typeof formData.transport, value: string | number) => {
    const val = typeof value === 'string' && value !== '' && field !== 'carType' ? parseFloat(value) : value;
    setFormData((prev) => ({
      ...prev,
      transport: { ...prev.transport, [field]: val === '' ? 0 : val },
    }));
    if (errors[field]) setErrors((prev) => { const c = { ...prev }; delete c[field]; return c; });
  };

  const updateFood = (field: keyof typeof formData.food, value: string | number) => {
    const val = typeof value === 'string' && value !== '' && field !== 'dietType' ? parseFloat(value) : value;
    setFormData((prev) => ({
      ...prev,
      food: { ...prev.food, [field]: val === '' ? 0 : val },
    }));
    if (errors[field]) setErrors((prev) => { const c = { ...prev }; delete c[field]; return c; });
  };

  const updateWaste = (field: keyof typeof formData.waste, value: string) => {
    const numVal = value === '' ? 0 : parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      waste: { ...prev.waste, [field]: numVal },
    }));
    if (errors[field]) setErrors((prev) => { const c = { ...prev }; delete c[field]; return c; });
  };

  return (
    <div className="calculator-view animate-fade-in">
      <div className="view-header">
        <div>
          <h1>Footprint Calculator</h1>
          <p>Input your habits below to estimate your annual greenhouse gas footprint.</p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <div className="calculator-layout">
        {/* Wizard Steps Navigation */}
        <div className="calculator-wizard">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                className={`wizard-step ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (validateStep(activeStep)) {
                    setActiveStep(step.id);
                  }
                }}
                type="button"
                aria-label={`Step ${step.label}`}
              >
                <div className="step-icon-wrapper">
                  <Icon size={18} />
                </div>
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Form Panel */}
        <Card variant="glass" className="calculator-card">
          <form onSubmit={handleSubmit} noValidate>
            {activeStep === 'energy' && (
              <div className="form-step-content animate-scale-up">
                <h3>Home Utility Consumptions</h3>
                <p className="step-desc">Help us estimate emissions generated by electricity, heating fuels, and water recycling.</p>
                
                <div className="form-group">
                  <label htmlFor="electricity">Monthly Electricity Usage (kWh)</label>
                  <input
                    id="electricity"
                    type="number"
                    min="0"
                    placeholder="e.g. 350"
                    value={formData.energy.electricity || ''}
                    onChange={(e) => updateEnergy('electricity', e.target.value)}
                    aria-invalid={!!errors.electricity}
                    aria-describedby={errors.electricity ? "electricity-err" : undefined}
                  />
                  {errors.electricity && <span id="electricity-err" className="input-error" role="alert">{errors.electricity}</span>}
                  <small className="help-text">Check your utility bill. Average household uses ~300-500 kWh/month.</small>
                </div>

                <div className="form-group">
                  <label htmlFor="gas">Monthly Natural Gas Usage (m³ or therms)</label>
                  <input
                    id="gas"
                    type="number"
                    min="0"
                    placeholder="e.g. 50"
                    value={formData.energy.gas || ''}
                    onChange={(e) => updateEnergy('gas', e.target.value)}
                    aria-invalid={!!errors.gas}
                    aria-describedby={errors.gas ? "gas-err" : undefined}
                  />
                  {errors.gas && <span id="gas-err" className="input-error" role="alert">{errors.gas}</span>}
                  <small className="help-text">Used for heating or gas stoves. Average is around 40-80 m³/month.</small>
                </div>

                <div className="form-group">
                  <label htmlFor="water">Daily Clean Water Usage per Person (Liters)</label>
                  <input
                    id="water"
                    type="number"
                    min="0"
                    placeholder="e.g. 150"
                    value={formData.energy.water || ''}
                    onChange={(e) => updateEnergy('water', e.target.value)}
                    aria-invalid={!!errors.water}
                    aria-describedby={errors.water ? "water-err" : undefined}
                  />
                  {errors.water && <span id="water-err" className="input-error" role="alert">{errors.water}</span>}
                  <small className="help-text">Showering, washing, toilets. US average: 300L/day. EU average: 150L/day.</small>
                </div>
              </div>
            )}

            {activeStep === 'transport' && (
              <div className="form-step-content animate-scale-up">
                <h3>Travel & Transportation Habits</h3>
                <p className="step-desc">Combustion engines are primary sources of greenhouse gases. Tell us about your mileage.</p>

                <div className="form-group">
                  <label htmlFor="carKm">Weekly Driving Distance (km)</label>
                  <input
                    id="carKm"
                    type="number"
                    min="0"
                    placeholder="e.g. 120"
                    value={formData.transport.carKm || ''}
                    onChange={(e) => updateTransport('carKm', e.target.value)}
                    aria-invalid={!!errors.carKm}
                    aria-describedby={errors.carKm ? "carKm-err" : undefined}
                  />
                  {errors.carKm && <span id="carKm-err" className="input-error" role="alert">{errors.carKm}</span>}
                </div>

                {formData.transport.carKm > 0 && (
                  <div className="form-group">
                    <label htmlFor="carType">Car Fuel or Engine Type</label>
                    <select
                      id="carType"
                      value={formData.transport.carType}
                      onChange={(e) => updateTransport('carType', e.target.value as any)}
                    >
                      <option value="petrol">Petrol (Gasoline)</option>
                      <option value="diesel">Diesel</option>
                      <option value="hybrid">Hybrid (Gas + Electric)</option>
                      <option value="electric">Battery Electric (EV)</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="transitHours">Weekly Public Transit Time (Hours)</label>
                  <input
                    id="transitHours"
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={formData.transport.transitHours || ''}
                    onChange={(e) => updateTransport('transitHours', e.target.value)}
                    aria-invalid={!!errors.transitHours}
                    aria-describedby={errors.transitHours ? "transitHours-err" : undefined}
                  />
                  {errors.transitHours && <span id="transitHours-err" className="input-error" role="alert">{errors.transitHours}</span>}
                  <small className="help-text">Total hours spent riding trains, subways, or city buses.</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="flightsShort">Short Flights (&lt; 3 hrs) per Year</label>
                    <input
                      id="flightsShort"
                      type="number"
                      min="0"
                      value={formData.transport.flightsShort || '0'}
                      onChange={(e) => updateTransport('flightsShort', e.target.value)}
                      aria-invalid={!!errors.flightsShort}
                      aria-describedby={errors.flightsShort ? "flightsShort-err" : undefined}
                    />
                    {errors.flightsShort && <span id="flightsShort-err" className="input-error" role="alert">{errors.flightsShort}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="flightsLong">Long Flights (&gt; 3 hrs) per Year</label>
                    <input
                      id="flightsLong"
                      type="number"
                      min="0"
                      value={formData.transport.flightsLong || '0'}
                      onChange={(e) => updateTransport('flightsLong', e.target.value)}
                      aria-invalid={!!errors.flightsLong}
                      aria-describedby={errors.flightsLong ? "flightsLong-err" : undefined}
                    />
                    {errors.flightsLong && <span id="flightsLong-err" className="input-error" role="alert">{errors.flightsLong}</span>}
                  </div>
                </div>
              </div>
            )}

            {activeStep === 'food' && (
              <div className="form-step-content animate-scale-up">
                <h3>Diet & Grocery Waste</h3>
                <p className="step-desc">Agriculture, livestock farming, and long-distance shipping generate heavy environmental footprint.</p>

                <div className="form-group">
                  <label htmlFor="dietType">Primary Diet Type</label>
                  <select
                    id="dietType"
                    value={formData.food.dietType}
                    onChange={(e) => updateFood('dietType', e.target.value as any)}
                  >
                    <option value="heavy-meat">Frequent Meat Eater (Daily Beef/Lamb/Pork)</option>
                    <option value="low-meat">Low Meat / Pescatarian (Poultry/Fish, rare beef)</option>
                    <option value="vegetarian">Vegetarian (No meat, consumes dairy & eggs)</option>
                    <option value="vegan">Vegan (Entirely plant-based)</option>
                  </select>
                  <small className="help-text">Beef and lamb have up to 20x the carbon intensity of beans or vegetables.</small>
                </div>

                <div className="form-group">
                  <label htmlFor="wasteIndex">Food Waste Scale (1 = Zero Waste, 5 = High Waste)</label>
                  <div className="slider-wrapper">
                    <input
                      id="wasteIndex"
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={formData.food.wasteIndex}
                      onChange={(e) => updateFood('wasteIndex', parseInt(e.target.value))}
                    />
                    <div className="slider-labels">
                      <span>1 (Zero scraps)</span>
                      <span>3 (Average)</span>
                      <span>5 (Throw out lots)</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="localRatio">Percentage of Food Bought Locally (%)</label>
                  <div className="slider-wrapper">
                    <input
                      id="localRatio"
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={formData.food.localRatio}
                      onChange={(e) => updateFood('localRatio', parseInt(e.target.value))}
                    />
                    <div className="slider-labels">
                      <span>0%</span>
                      <span>{formData.food.localRatio}%</span>
                      <span>100% (Farmers Market)</span>
                    </div>
                  </div>
                  {errors.localRatio && <span className="input-error" role="alert">{errors.localRatio}</span>}
                </div>
              </div>
            )}

            {activeStep === 'waste' && (
              <div className="form-step-content animate-scale-up">
                <h3>Consumption & Recycling</h3>
                <p className="step-desc">Materials sent to landfills slowly decompose, emitting greenhouse gases like methane.</p>

                <div className="form-group">
                  <label htmlFor="bags">Weekly Landfill Trash Bags (50L bags)</label>
                  <input
                    id="bags"
                    type="number"
                    min="0"
                    placeholder="e.g. 2"
                    value={formData.waste.bags || ''}
                    onChange={(e) => updateWaste('bags', e.target.value)}
                    aria-invalid={!!errors.bags}
                    aria-describedby={errors.bags ? "bags-err" : undefined}
                  />
                  {errors.bags && <span id="bags-err" className="input-error" role="alert">{errors.bags}</span>}
                  <small className="help-text">Standard black garbage bins/bags thrown out each week.</small>
                </div>

                <div className="form-group">
                  <label htmlFor="recycleRatio">Percentage of Waste Recycled (%)</label>
                  <div className="slider-wrapper">
                    <input
                      id="recycleRatio"
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={formData.waste.recycleRatio}
                      onChange={(e) => updateWaste('recycleRatio', e.target.value)}
                    />
                    <div className="slider-labels">
                      <span>0% (None)</span>
                      <span>{formData.waste.recycleRatio}%</span>
                      <span>100% (Zero Landfill)</span>
                    </div>
                  </div>
                  {errors.recycleRatio && <span className="input-error" role="alert">{errors.recycleRatio}</span>}
                  <small className="help-text">Includes compost, paper sorting, recycling cans/plastics.</small>
                </div>
              </div>
            )}

            {/* Step Navigation Controls */}
            <div className="calculator-actions">
              {activeStep !== 'energy' ? (
                <Button variant="outline" type="button" onClick={handlePrev}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </Button>
              ) : (
                <div /> // Spacer
              )}

              {activeStep !== 'waste' ? (
                <Button variant="primary" type="button" onClick={handleNext}>
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button variant="primary" type="submit">
                  <Save size={16} />
                  <span>Save Footprint</span>
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Real-time feedback widget */}
        <Card variant="glow" className="live-feedback-card">
          <h3>Live Impact Estimation</h3>
          <div className="live-emissions-value">
            <span className="value-num">{(liveEmissions.total / 1000).toFixed(2)}</span>
            <span className="value-unit">Tonnes CO₂e / Year</span>
          </div>
          
          <div className="live-breakdown">
            <div className="live-breakdown-row">
              <span className="bullet energy"></span>
              <span>Home Energy</span>
              <strong>{(liveEmissions.energy / 1000).toFixed(2)} t</strong>
            </div>
            <div className="live-breakdown-row">
              <span className="bullet transport"></span>
              <span>Transport</span>
              <strong>{(liveEmissions.transport / 1000).toFixed(2)} t</strong>
            </div>
            <div className="live-breakdown-row">
              <span className="bullet food"></span>
              <span>Diet & Food</span>
              <strong>{(liveEmissions.food / 1000).toFixed(2)} t</strong>
            </div>
            <div className="live-breakdown-row">
              <span className="bullet waste"></span>
              <span>Waste & Recycle</span>
              <strong>{(liveEmissions.waste / 1000).toFixed(2)} t</strong>
            </div>
          </div>

          <div className="live-footprint-tip">
            <Info size={16} className="tip-icon" />
            <p>
              {liveEmissions.total > 10000 
                ? "Your footprint is currently above average. Switch categories to check how diet tweaks or shorter commutes cut down emissions."
                : "Great start! You're keeping your emissions lower than the national average. Complete challenges to lower it further."}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
