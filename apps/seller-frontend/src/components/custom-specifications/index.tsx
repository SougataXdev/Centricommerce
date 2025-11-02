'use client';

import { Controller, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import React from 'react';

type Props = {
  control: any; // react-hook-form control object
  errors?: any; // Form errors from react-hook-form
};

const CustomSpecifications = ({ control, errors }: Props) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'custom_specifications',
  });

  const handleAddField = () => {
    append({ name: '', value: '' });
  };

  return (
    <div className="w-full space-y-4">
      {/* Specifications Table/Grid */}
      <div className="overflow-hidden">
        {fields && fields.length > 0 ? (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-2 gap-3 mb-3 px-0">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Specification Name
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Value
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200"></div>

            {/* Specifications Rows */}
            {fields.map((item, index) => (
              <div key={item.id} className="space-y-2 py-3">
                <div className="grid grid-cols-2 gap-3 items-start">
                  {/* Name Input */}
                  <div>
                    <Controller
                      name={`custom_specifications.${index}.name`}
                      control={control}
                      rules={{
                        required: 'Specification name is required',
                        minLength: {
                          value: 1,
                          message: 'Name must not be empty',
                        },
                      }}
                      render={({ field }) => (
                        <div>
                          <input
                            {...field}
                            type="text"
                            placeholder="e.g., Battery Life, Weight, Material"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            aria-label={`Specification name ${index + 1}`}
                          />
                          {errors?.custom_specifications?.[index]?.name && (
                            <p className="text-red-500 text-xs mt-1 font-medium">
                              {errors.custom_specifications[index].name.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Value Input with Delete Button */}
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Controller
                        name={`custom_specifications.${index}.value`}
                        control={control}
                        rules={{
                          required: 'Specification value is required',
                          minLength: {
                            value: 1,
                            message: 'Value must not be empty',
                          },
                        }}
                        render={({ field }) => (
                          <div>
                            <input
                              {...field}
                              type="text"
                              placeholder="e.g., 5000mAh, 200g, Cotton"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              aria-label={`Specification value ${index + 1}`}
                            />
                            {errors?.custom_specifications?.[index]?.value && (
                              <p className="text-red-500 text-xs mt-1 font-medium">
                                {
                                  errors.custom_specifications[index].value
                                    .message
                                }
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mt-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition duration-200 flex-shrink-0"
                      title="Remove specification"
                      aria-label={`Remove specification ${index + 1}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Divider between rows */}
                {index < fields.length - 1 && (
                  <div className="border-t border-slate-100"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500">
              No specifications added yet
            </p>
          </div>
        )}
      </div>

      {/* Add Button */}
      <button
        type="button"
        onClick={handleAddField}
        className="w-full px-4 py-2 border border-slate-300 rounded text-slate-700 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition duration-200 flex items-center justify-center gap-2 font-medium text-sm"
        aria-label="Add new specification"
      >
        <Plus size={18} />
        Add Specification
      </button>
    </div>
  );
};

export default CustomSpecifications;
