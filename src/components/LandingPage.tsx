import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Keyboard, Trophy, Users, ArrowRight, Zap, BarChart2, Award, Sparkles, Star, Target, CheckCircle } from 'lucide-react';
import { AuthForm } from './AuthForm';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Advertisement } from './Advertisement';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';

export function LandingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Keyboard className="w-8 h-8 text-indigo-500" />,
      titleKey: 'landing.features.improve.title',
      descriptionKey: 'landing.features.improve.description'
    },
    {
      icon: <Trophy className="w-8 h-8 text-indigo-500" />,
      titleKey: 'landing.features.track.title',
      descriptionKey: 'landing.features.track.description'
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-500" />,
      titleKey: 'landing.features.compete.title',
      descriptionKey: 'landing.features.compete.description'
    }
  ];

  // Load arrays from translations when available (returnObjects allows arrays/objects)
  const testimonials = (t('landing.testimonials', { returnObjects: true }) as Array<any>) || [];

  const benefitsFromLocale = (t('landing.benefits', { returnObjects: true }) as Array<any>) || [];
  const benefits = benefitsFromLocale.length > 0 ? benefitsFromLocale.map((b: any) => ({
    icon: b.icon ? b.icon : <Zap className="w-6 h-6 text-white" />,
    title: b.title,
    description: b.description
  })) : [
    { icon: <Zap className="w-6 h-6 text-white" />, title: 'Speed Improvement', description: 'Increase your typing speed by up to 50% in just 2 weeks of regular practice' },
    { icon: <CheckCircle className="w-6 h-6 text-white" />, title: 'Accuracy Training', description: 'Reduce errors and develop muscle memory for precise typing' },
    { icon: <Trophy className="w-6 h-6 text-white" />, title: 'Skill Certification', description: 'Earn certificates to showcase your typing proficiency to employers' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center mb-6">
              <div className="relative mr-3">
                <div className="absolute inset-0 bg-indigo-600 rounded-lg blur opacity-30"></div>
                <div className="relative bg-white p-3 rounded-lg shadow-lg">
                  <Keyboard className="w-10 h-10 text-indigo-600" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-indigo-600">TypingMaster</h1>
                <p className="text-sm text-indigo-400">{t('landing.hero.tagline')}</p>
              </div>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              {t('landing.hero.title')}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {t('landing.hero.subtitle')}
            </p>
            <div className="grid gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t(feature.titleKey)}</h3>
                    <p className="text-gray-600">{t(feature.descriptionKey)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative flex justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50 w-full max-w-md">
              <AuthForm />
            </div>
          </motion.div>
        </div>

        {/* Add horizontal advertisement after the hero section */}
        <div className="mt-12">
          <Advertisement
            slot="landing-horizontal"
            format="horizontal"
            style={{ display: 'block', textAlign: 'center' }}
          />
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-24"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 text-white">
              <h2 className="text-3xl font-bold mb-8 text-center">{t('landing.whyChoose.title')}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                    <div className="bg-indigo-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-indigo-100">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('landing.featuresShowcase.powerfulTitle')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landing.featuresShowcase.description')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <Zap className="w-12 h-12 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('landing.whyChoose.boostSpeed.title')}</h3>
              <p className="text-gray-600">
                {t('landing.whyChoose.boostSpeed.description')}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <BarChart2 className="w-12 h-12 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('landing.whyChoose.trackProgress.title')}</h3>
              <p className="text-gray-600">
                {t('landing.whyChoose.trackProgress.description')}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <Award className="w-12 h-12 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('landing.whyChoose.earnAchievements.title')}</h3>
              <p className="text-gray-600">
                {t('landing.whyChoose.earnAchievements.description')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-24 bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('landing.testimonialsTitle', 'What Our Users Say')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl relative">
                <div className="absolute -top-3 -left-3">
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                </div>
                <p className="text-gray-600 italic mb-4">"{t(`landing.testimonials.${index}.quote`, { defaultValue: testimonial.quote })}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{t(`landing.testimonials.${index}.author`, { defaultValue: testimonial.author })}</p>
                  <p className="text-sm text-gray-500">{t(`landing.testimonials.${index}.role`, { defaultValue: testimonial.role })}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Features Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-24"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 text-white">
                <Sparkles className="w-10 h-10 mb-4" />
                <h2 className="text-3xl font-bold mb-4">{t('landing.advancedFeatures.title')}</h2>
                <p className="text-indigo-100 mb-6">
                  TypingMaster offers a comprehensive set of features designed to help you become a typing expert.
                </p>
                
                <ul className="space-y-3">
                  {(t('landing.featuresShowcase.list', { returnObjects: true }) as string[]).map((item, idx) => (
                    <li key={idx} className="flex items-center">
                      <div className="bg-white/20 p-1 rounded-full mr-3">
                        <Target className="w-4 h-4" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1555532538-dcdbd01d373d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Person typing on keyboard" 
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-indigo-600/50"></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-24 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t('landing.cta.subtitle')}
          </p>
          <button
            onClick={() => document.querySelector('input')?.focus()}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
          >
            {t('landing.cta.button')} <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </motion.div>

        {/* Add another advertisement before the footer */}
        <div className="mt-24">
          <Advertisement
            slot="landing-bottom"
            format="rectangle"
            style={{ display: 'block', margin: '0 auto', maxWidth: '728px' }}
          />
        </div>
        
        {/* Footer */}
        <footer className="mt-24 text-center text-gray-500 text-sm">
          <div className="flex justify-center space-x-6 mb-4">
            <Keyboard className="w-5 h-5" />
            <Trophy className="w-5 h-5" />
            <Users className="w-5 h-5" />
          </div>
          <p>© {new Date().getFullYear()} TypingMaster. All rights reserved.</p>
          <p className="mt-2">{t('landing.footer.improveSkills')}</p>
        </footer>
      </div>
    </div>
  );
}