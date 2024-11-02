"use client"
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface FormData {
  name: string;
  pronouns: string;
  age: string;
  email: string;
  contactNumber: string;
  igHandle: string;
  placement: string;
  size: string;
  budget: string;
  availableDates: string;
  comments: string;
  health: string;
  contactPreferences: {
    instagram: boolean;
    mobile: boolean;
    email: boolean;
  };
}

interface FormErrors {
  [key: string]: string;
}

const BookingsPage = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    pronouns: '',
    age: '',
    email: '',
    contactNumber: '',
    igHandle: '',
    placement: '',
    size: '',
    budget: '',
    availableDates: '',
    comments: '',
    health: '',
    contactPreferences: {
      instagram: false,
      mobile: false,
      email: false,
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (parseInt(formData.age) < 18) {
      newErrors.age = 'Must be 18 or older';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.placement.trim()) newErrors.placement = 'Placement is required';
    if (!formData.size.trim()) newErrors.size = 'Size is required';
    if (!formData.availableDates.trim()) newErrors.availableDates = 'Available dates are required';
    if (!formData.health.trim()) newErrors.health = 'Health declaration is required';
    if (!formData.budget.trim()) newErrors.budget = 'Budget declaration is required';
    if (!Object.values(formData.contactPreferences).some(value => value)) {
      newErrors.contactPreferences = 'Please select at least one preferred contact method';
    }

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 4);
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setSelectedImages(prev => [...prev, ...newFiles].slice(0, 4));
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls].slice(0, 4));
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCheckboxChange = (contactType: 'instagram' | 'mobile' | 'email') => {
    setFormData(prev => ({
      ...prev,
      contactPreferences: {
        ...prev.contactPreferences,
        [contactType]: !prev.contactPreferences[contactType]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitMessage({ 
        type: 'error', 
        message: 'Please fill in all required fields correctly.' 
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });

    try {
      const submitData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      
      selectedImages.forEach(file => {
        submitData.append('images', file);
      });

      Object.entries(formData.contactPreferences).forEach(([key, value]) => {
        submitData.append(`contactPreferences.${key}`, value.toString());
      });

      const response = await fetch('/api/submit-booking', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          const minutes = Math.ceil(data.resetInSeconds / 60);
          setSubmitMessage({
            type: 'error',
            message: `Too many requests. Please try again in ${minutes} minutes.`
          });
        } else {
          throw new Error(data.error || 'Failed to submit form');
        }
        return;
      }

      setSubmitMessage({
        type: 'success',
        message: 'Booking request sent successfully!'
      });

      setFormData({
        name: '',
        pronouns: '',
        age: '',
        email: '',
        contactNumber: '',
        igHandle: '',
        placement: '',
        size: '',
        budget: '',
        availableDates: '',
        comments: '',
        health: '',
        contactPreferences: {
          instagram: false,
          mobile: false,
          email: false,
        }
      });
      
      setImagePreviewUrls(prev => {
        prev.forEach(url => URL.revokeObjectURL(url));
        return [];
      });
      setSelectedImages([]);

    } catch (error) {
      console.error('Submission error:', error);
      setSubmitMessage({
        type: 'error',
        message: 'Failed to send booking request. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (name: Exclude<keyof FormData, 'contactPreferences'>, placeholder: string, type: string = 'text', isTextArea: boolean = false) => {
    const isRequired = [
      'name', 'age', 'email', 'contactNumber', 
      'placement', 'size', 'availableDates', 'health', 'budget'
    ].includes(name);

    const Component = isTextArea ? 'textarea' : 'input';
    
    return (
      <div>
        <Component
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={`${placeholder}${isRequired ? ' *' : ''}`}
          className={`w-full bg-transparent border-b-[1px] 
            ${errors[name] ? 'border-red-400' : 'border-gray-400'}
            px-2 py-3 focus:outline-none focus:border-b-[2px] focus:border-white 
            transition-all text-gray-300 placeholder-gray-400
            ${isTextArea ? 'scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400' : ''}`}
        />
        {errors[name] && (
          <p className="text-red-400 text-sm mt-1">{errors[name]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-6 left-6">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors text-2xl">
          <ArrowLeft size={28} />
        </Link>
      </div>

      <div className="absolute w-96 h-96 bg-gray-100 rounded-full filter blur-3xl opacity-50 animate-blob z-0" />
      <div className="absolute w-96 h-96 bg-gray-400 rounded-full filter blur-3xl opacity-50 animate-blob2 z-0" />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-[450px] h-[450px] bg-black rounded-full z-5 filter blur-md" />
      </div>

      <h1 style={{ fontFamily: 'Title' }} className="text-4xl font-bold pt-12">
        NAPTIMER
      </h1>

      {submitMessage.type === 'success' ? (
      <div className="z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      p-8 bg-gray-500/20 rounded-lg max-w-md text-center">
        <h2 className="text-2xl text-gray-300 mb-4">Booking Request Sent!</h2>
        <p className="text-gray-300">Thank you for your submission :)</p>
      </div>
      ) : (
        <>
          {submitMessage.message && submitMessage.type === 'error' && (
            <div className="z-10 mb-4 p-3 rounded-lg bg-red-500/20 text-red-200">
              {submitMessage.message}
            </div>
          )}
          <div className="z-10 w-full max-w-2xl p-8 text-gray-400 space-y-2 text-center">
            <p>
              thank you for showing interest in my work! please fill out the booking form below and i will reach out soon.
            </p>
            <p>
              if our session is confirmed, there will be a $100 deposit to secure your slot which will be deducted from the final amount on the tattoo day itself. i look forward to meeting you :)
            </p>
          </div>
          <div className="z-10 w-full max-w-2xl px-8 pb-2 font-Body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderField('name', 'name')}
              {renderField('pronouns', 'pronouns')}
              {renderField('age', 'age')}
              {renderField('email', 'email', 'email')}
              {renderField('contactNumber', 'contact number', 'tel')}
              {renderField('igHandle', 'IG handle')}
              {renderField('placement', 'placement')}
              {renderField('size', 'size')}
              {renderField('budget', 'budget')}
              {renderField('availableDates', 'available dates')}
              {renderField('comments', 'comments', 'text', true)}
              {renderField('health', 'declare health conditions here', 'text', true)}
              {/* Contact Preferences Section */}
              <div className="space-y-2">
              <p className="text-gray-400 text-sm mb-2">Preferred mode of contact *</p>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.contactPreferences.instagram}
                      onChange={() => handleCheckboxChange('instagram')}
                      className="sr-only"
                    />
                    <div className={`h-4 w-4 border rounded border-gray-400 
                      ${formData.contactPreferences.instagram ? 'bg-black' : 'bg-transparent'}`}>
                      {formData.contactPreferences.instagram && (
                        <svg 
                          className="h-4 w-4 text-white stroke-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <polyline points="18 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-400">Instagram</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.contactPreferences.mobile}
                      onChange={() => handleCheckboxChange('mobile')}
                      className="sr-only"
                    />
                    <div className={`h-4 w-4 border rounded border-gray-400 
                      ${formData.contactPreferences.mobile ? 'bg-black' : 'bg-transparent'}`}>
                      {formData.contactPreferences.mobile && (
                        <svg 
                          className="h-4 w-4 text-white stroke-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <polyline points="18 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-400">Mobile (WhatsApp/Telegram)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.contactPreferences.email}
                      onChange={() => handleCheckboxChange('email')}
                      className="sr-only"
                    />
                    <div className={`h-4 w-4 border rounded border-gray-400 
                      ${formData.contactPreferences.email ? 'bg-black' : 'bg-transparent'}`}>
                      {formData.contactPreferences.email && (
                        <svg 
                          className="h-4 w-4 text-white stroke-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <polyline points="18 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-400">Email</span>
                </label>
              </div>
              {errors.contactPreferences && (
                <p className="text-red-400 text-sm">{errors.contactPreferences}</p>
              )}
            </div>

              <p className="text-gray-400 text-sm">Upload pictures of Flashes / References / Desired placements</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1
                                 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {imagePreviewUrls.length < 4 && (
                    <label className="border-2 border-dashed border-gray-400 rounded-lg 
                                    h-32 flex items-center justify-center cursor-pointer
                                    hover:border-white transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <span className="text-gray-400">+ Add Image</span>
                    </label>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-8 bg-transparent border border-gray-400 text-gray-400 py-3 px-6
                  rounded-full hover:bg-gray-400 hover:text-black
                  transition-all duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'opacity-80 hover:opacity-100'}`}
              >
                {isSubmitting ? 'Sending...' : 'Send Request'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingsPage;