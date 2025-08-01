import { useState,useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utills/axiosClient';
import { useNavigate, useParams } from 'react-router'; 

 const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
   Constraints:z.string(),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['math', 'array', 'linkedList', 'graph', 'dp','string']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required'),
    })
  ).min(1, 'At least one visible test case is required.'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
    })
  ).min(1, 'At least one hidden test case is required.'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript', 'Python']),
      initialCode: z.string().min(1, 'Initial code is required'),
    })
  ).length(4, 'All four language templates are required.'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript', 'Python']),
      completeCode: z.string().min(1, 'Complete code is required'),
    })
  ).length(4, 'All four language solutions are required.'),
});
const LANGUAGES = ['C++', 'Java', 'JavaScript', 'Python'];

 const UpdateProblem= () =>{
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
   const [activeLanguageIndex, setActiveLanguageIndex] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      // must match your schema shape
      title: '',
      description: '',
      difficulty: 'easy',
      tags: 'array',
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
      startCode: LANGUAGES.map((lang) => ({ language: lang, initialCode: '' })),
      referenceSolution: LANGUAGES.map((lang) => ({ language: lang, completeCode: '' })),
    },
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } =
    useFieldArray({ control, name: 'visibleTestCases' });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } =
    useFieldArray({ control, name: 'hiddenTestCases' });

  // 1️⃣ Fetch existing data on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosClient.get(`/problem/problemById/${id}`);
        // reset form with fetched values
        reset({
          title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        tags: data.tags, 
        Constraints:data.Constraints,


        // ▶️ Explicitly set both arrays from the server:
        visibleTestCases: data.visibleTestCases,
        hiddenTestCases: data.hiddenTestCases,
          startCode: LANGUAGES.map((lang) => {
            const item = data.startCode.find((c) => c.language === lang);
            return { language: lang, initialCode: item?.initialCode || '' };
          }),
          referenceSolution: LANGUAGES.map((lang) => {
            const sol = data.referenceSolution.find((c) => c.language === lang);
            return { language: lang, completeCode: sol?.completeCode || '' };
          }),
        });
      } catch (err) {
        console.error('Failed to load problem:', err);
        alert('Could not fetch problem data.');
        navigate('/');
      }
    })();
  }, [id, reset, navigate]);

   const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await axiosClient.put(`/problem/update/${id}`, formData);
      alert('Problem updated successfully!');
      navigate('/admin/update');
    } catch (error) {
      alert(`Update failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

   const CodeInput = ({ fieldName, label, languageIndex }) => (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <div className="bg-base-300 rounded-lg p-1 font-mono">
        <textarea
          {...register(fieldName)}
          className="textarea w-full bg-base-200 h-48 leading-relaxed tracking-wider"
          placeholder={`Enter ${label.toLowerCase()} for ${LANGUAGES[languageIndex]}...`}
        />
      </div>
       {errors.startCode?.[languageIndex]?.initialCode && (
          <label className="label">
             <span className="label-text-alt text-error">{errors.startCode?.[languageIndex]?.initialCode?.message}</span>
          </label>
       )}
       {errors.referenceSolution?.[languageIndex]?.completeCode && (
          <label className="label">
             <span className="label-text-alt text-error">{errors.referenceSolution?.[languageIndex]?.completeCode?.message}</span>
          </label>
       )}
    </div>
  );


  return (
    <div className="container mx-auto p-4 md:p-8 bg-base-200 min-h-screen">
      <div className="max-w-4xl mx-auto">
          <header className="mb-8">
          <h1 className="text-4xl font-bold text-primary">Update Problem</h1>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl">Basic Information</h2>
              <div className="form-control">
                <label className="label"><span className="label-text mr-1.5">Title</span></label>
                <input {...register('title')} className={`input input-bordered ${errors.title ? 'input-error' : ''}`} />
                {errors.title && <label className="label"><span className="label-text-alt text-error">{errors.title.message}</span></label>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text mr-1.5">Description</span></label>
                <textarea {...register('description')} className={`textarea textarea-bordered h-32 ${errors.description ? 'textarea-error' : ''}`} />
                {errors.description && <label className="label"><span className="label-text-alt text-error">{errors.description.message}</span></label>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-control">
                  <label className="label"><span className="label-text mr-1.5">Difficulty</span></label>
                  <select {...register('difficulty')} className={`select select-bordered ${errors.difficulty ? 'select-error' : ''}`}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text mr-1.5">Tag</span></label>
                  <select {...register('tags')} className={`select select-bordered ${errors.tags ? 'select-error' : ''}`}>
                    <option value="array">Array</option>
                    <option value="math">Math</option>
                    <option value="linkedList">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="dp">DP</option>
                     <option value="string">String</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Test Cases */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl">Test Cases</h2>
              
              {/* Visible Test Cases */}
              <div>
                <h3 className="text-lg font-semibold mt-2">Visible Test Cases</h3>
                <p className="text-sm opacity-60 mb-4">These are shown to the user as examples.</p>
                <div className="space-y-4">
                  {visibleFields.map((field, index) => (
                    <div key={field.id} className="p-4 border border-base-300 rounded-lg space-y-3 bg-base-200/30">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary">Example #{index + 1}</span>
                        <button type="button" onClick={() => removeVisible(index)} className="btn btn-sm btn-ghost text-error">🗑️ Remove</button>
                      </div>
                      <input {...register(`visibleTestCases.${index}.input`)} placeholder="Input" className="input input-sm input-bordered w-full" />
                       <input {...register(`visibleTestCases.${index}.input`)} placeholder="Input for frontend" className="input input-sm input-bordered w-full" />
                      <input {...register(`visibleTestCases.${index}.output`)} placeholder="Output" className="input input-sm input-bordered w-full" />
                      <textarea {...register(`visibleTestCases.${index}.explanation`)} placeholder="Explanation" className="textarea textarea-sm textarea-bordered w-full" />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => appendVisible({ input: '', output: '', explanation: '' })} className="btn btn-sm btn-primary mt-4">
                  + Add Visible Case
                </button>
                 {errors.visibleTestCases && <p className="text-error text-sm mt-2">{errors.visibleTestCases.message || errors.visibleTestCases.root?.message}</p>}
              </div>
              
              <div className="divider"></div>

              {/* Hidden Test Cases */}
              <div>
                <h3 className="text-lg font-semibold">Hidden Test Cases</h3>
                <p className="text-sm opacity-60 mb-4">These are used to judge the correctness of the user's solution.</p>
                <div className="space-y-4">
                  {hiddenFields.map((field, index) => (
                    <div key={field.id} className="p-4 border border-base-300 rounded-lg space-y-3 bg-base-200/30">
                       <div className="flex justify-between items-center">
                        <span className="font-bold">Hidden Case #{index + 1}</span>
                        <button type="button" onClick={() => removeHidden(index)} className="btn btn-sm btn-ghost text-error">🗑️ Remove</button>
                      </div>
                      <input {...register(`hiddenTestCases.${index}.input`)} placeholder="Input" className="input input-sm input-bordered w-full" />
                      <input {...register(`hiddenTestCases.${index}.output`)} placeholder="Output" className="input input-sm input-bordered w-full" />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="btn btn-sm btn-secondary mt-4">
                  + Add Hidden Case
                </button>
                 {errors.hiddenTestCases && <p className="text-error text-sm mt-2">{errors.hiddenTestCases.message || errors.hiddenTestCases.root?.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Code Templates & Solutions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl">Code Templates</h2>
              <p className="text-sm opacity-60 mb-4">Provide the starter code and reference solution for each language.</p>
              
              {/* Tabbed Interface */}
              <div role="tablist" className="tabs tabs-lifted tabs-lg">
                {LANGUAGES.map((lang, index) => (
                  <button
                    key={lang}
                    type="button"
                    role="tab"
                    className={`tab ${activeLanguageIndex === index ? 'tab-active' : ''}`}
                    onClick={() => setActiveLanguageIndex(index)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              
              {/* Tab Content */}
              <div className="bg-base-200 p-6 rounded-b-lg rounded-tr-lg">
                  <div className="space-y-4">
                      <CodeInput 
                          label="Initial Starter Code" 
                          fieldName={`startCode.${activeLanguageIndex}.initialCode`} 
                          languageIndex={activeLanguageIndex}
                      />
                      <CodeInput 
                          label="Complete Reference Solution" 
                          fieldName={`referenceSolution.${activeLanguageIndex}.completeCode`} 
                          languageIndex={activeLanguageIndex}
                      />
                  </div>
              </div>
            </div>
          </div>
           <div className="form-control">
                <label className="label"><span className="label-text mr-1.5"> Constraints</span></label>
                <textarea {...register('Constraints')} className={`textarea textarea-bordered h-32 ${errors.description ? 'textarea-error' : ''}`} />
                {errors.description && <label className="label"><span className="label-text-alt text-error">{errors.description.message}</span></label>}
              </div>


          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              className="btn btn-warning btn-lg w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Updating...
                </>
              ) : (
                'Update Problem'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default UpdateProblem