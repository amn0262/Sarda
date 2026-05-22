'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { 
  Database, Settings as SettingsIcon, ShieldCheck, Download, Trash, 
  Upload, Copy, Check, User, Briefcase, FileText, Globe, Facebook, 
  Twitter, Instagram, Linkedin, Youtube, Send, Save 
} from 'lucide-react';

export default function SettingsPage() {
  const { stories, folders, importData, profile, updateProfile } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile fields state initialized directly from persistent store
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [jobTitle, setJobTitle] = useState(profile?.jobTitle || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [facebook, setFacebook] = useState(profile?.facebook || '');
  const [twitter, setTwitter] = useState(profile?.twitter || '');
  const [instagram, setInstagram] = useState(profile?.instagram || '');
  const [linkedin, setLinkedin] = useState(profile?.linkedin || '');
  const [youtube, setYoutube] = useState(profile?.youtube || '');
  const [telegram, setTelegram] = useState(profile?.telegram || '');

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleExportData = () => {
    const data = { folders, stories };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sarda-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.folders && data.stories) {
          if (confirm('سيتم استبدال جميع البيانات الحالية بالبيانات المستوردة. هل أنت متأكد؟')) {
            importData(data);
            alert('تم استيراد البيانات بنجاح!');
          }
        } else {
          alert('ملف النسخة الاحتياطية غير صالح.');
        }
      } catch (error) {
        alert('حدث خطأ أثناء قراءة الملف.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    if (confirm('هل أنت متأكد من رغبتك في حذف كافة المجلدات والقصص بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.')) {
      importData({ folders: [], stories: [] });
      alert('تم إرجاع التطبيق لحالته الأصلية وحذف كافة البيانات بنجاح.');
    }
  };

  const handleCopy = (text: string, fieldKey: string) => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: fullName.trim(),
      jobTitle: jobTitle.trim(),
      bio: bio.trim(),
      website: website.trim(),
      facebook: facebook.trim(),
      twitter: twitter.trim(),
      instagram: instagram.trim(),
      linkedin: linkedin.trim(),
      youtube: youtube.trim(),
      telegram: telegram.trim(),
    });
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto min-h-screen">
      <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
          <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">إعدادات التطبيق</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">إدارة معلوماتك الشخصية، وبياناتك المحلية وقواعد البيانات</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Personal Profile Settings Block */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-550" />
              <span>الملف الشخصي وصانع المحتوى</span>
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-550 font-medium">بياناتك الشخصية وشبكات التواصل</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Row 1: Name and Job Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الاسم الكامل</label>
                <div className="relative flex items-center">
                  <span className="absolute right-3 text-slate-400 dark:text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="بيتر بكور، أيمن أحمد، إلخ"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm text-slate-850 dark:text-slate-100 transition-all font-medium"
                  />
                  {fullName && (
                    <button
                      type="button"
                      onClick={() => handleCopy(fullName, 'fullName')}
                      className="absolute left-2.5 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all cursor-pointer"
                      title="نسخ الاسم"
                    >
                      {copiedField === 'fullName' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">المسمى المهني / الوظيفي</label>
                <div className="relative flex items-center">
                  <span className="absolute right-3 text-slate-400 dark:text-slate-500">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="مقدم بودكاست، كاتب محتوى، صحفي"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full pl-12 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm text-slate-850 dark:text-slate-100 transition-all"
                  />
                  {jobTitle && (
                    <button
                      type="button"
                      onClick={() => handleCopy(jobTitle, 'jobTitle')}
                      className="absolute left-2.5 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all cursor-pointer"
                      title="نسخ المسمى الوظيفي"
                    >
                      {copiedField === 'jobTitle' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">النبذة الشخصية (Bio)</label>
              <div className="relative">
                <textarea
                  rows={3}
                  placeholder="اكتب نبذة شخصية مختصرة عن نفسك وعن مجالك والبودكاست الخاص بك..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm text-slate-850 dark:text-slate-100 transition-all resize-none leading-relaxed"
                />
                {bio && (
                  <button
                    type="button"
                    onClick={() => handleCopy(bio, 'bio')}
                    className="absolute bottom-3 left-3 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all cursor-pointer"
                    title="نسخ النبذة"
                  >
                    {copiedField === 'bio' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Social Media Section */}
            <div>
              <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 mt-4">روابط مواقع التواصل الاجتماعي والموقع العلمي</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Website */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">الموقع الإلكتروني</label>
                  <div className="relative flex items-center">
                    <span className="absolute right-3 text-slate-400 dark:text-slate-500">
                      <Globe className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full pl-12 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-slate-850 dark:text-slate-100 transition-all ltr"
                    />
                    {website && (
                      <button
                        type="button"
                        onClick={() => handleCopy(website, 'website')}
                        className="absolute left-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-855 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 cursor-pointer"
                      >
                        {copiedField === 'website' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Twitter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">تويتر / منصة X</label>
                  <div className="relative flex items-center">
                    <span className="absolute right-3 text-slate-400 dark:text-slate-500">
                      <Twitter className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      placeholder="https://x.com/username"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="w-full pl-12 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-slate-850 dark:text-slate-100 transition-all ltr"
                    />
                    {twitter && (
                      <button
                        type="button"
                        onClick={() => handleCopy(twitter, 'twitter')}
                        className="absolute left-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-855 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 cursor-pointer"
                      >
                        {copiedField === 'twitter' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Telegram */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">تيليجرام</label>
                  <div className="relative flex items-center">
                    <span className="absolute right-3 text-slate-400 dark:text-slate-500">
                      <Send className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      placeholder="https://t.me/username"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      className="w-full pl-12 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-slate-850 dark:text-slate-100 transition-all ltr"
                    />
                    {telegram && (
                      <button
                        type="button"
                        onClick={() => handleCopy(telegram, 'telegram')}
                        className="absolute left-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-855 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 cursor-pointer"
                      >
                        {copiedField === 'telegram' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Linkedin */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">لينكد إن (LinkedIn)</label>
                  <div className="relative flex items-center">
                    <span className="absolute right-3 text-slate-400 dark:text-slate-500">
                      <Linkedin className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full pl-12 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-slate-850 dark:text-slate-100 transition-all ltr"
                    />
                    {linkedin && (
                      <button
                        type="button"
                        onClick={() => handleCopy(linkedin, 'linkedin')}
                        className="absolute left-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-855 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 cursor-pointer"
                      >
                        {copiedField === 'linkedin' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Facebook */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">فيسبوك</label>
                  <div className="relative flex items-center">
                    <span className="absolute right-3 text-slate-400 dark:text-slate-500">
                      <Facebook className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      placeholder="https://facebook.com/username"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="w-full pl-12 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-slate-855 dark:text-slate-100 transition-all ltr"
                    />
                    {facebook && (
                      <button
                        type="button"
                        onClick={() => handleCopy(facebook, 'facebook')}
                        className="absolute left-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-855 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 cursor-pointer"
                      >
                        {copiedField === 'facebook' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Instagram */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">إنستغرام</label>
                  <div className="relative flex items-center">
                    <span className="absolute right-3 text-slate-400 dark:text-slate-500">
                      <Instagram className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      placeholder="https://instagram.com/username"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full pl-12 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-slate-855 dark:text-slate-100 transition-all ltr"
                    />
                    {instagram && (
                      <button
                        type="button"
                        onClick={() => handleCopy(instagram, 'instagram')}
                        className="absolute left-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-855 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 cursor-pointer"
                      >
                        {copiedField === 'instagram' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Youtube */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">قناة اليوتيوب</label>
                  <div className="relative flex items-center">
                    <span className="absolute right-3 text-slate-400 dark:text-slate-500">
                      <Youtube className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      placeholder="https://youtube.com/@channel"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      className="w-full pl-12 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-slate-855 dark:text-slate-100 transition-all ltr"
                    />
                    {youtube && (
                      <button
                        type="button"
                        onClick={() => handleCopy(youtube, 'youtube')}
                        className="absolute left-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-855 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 cursor-pointer"
                      >
                        {copiedField === 'youtube' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Save Button with Success Notification */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-indigo-500/10"
              >
                <Save className="w-4 h-4" />
                حفظ معلومات الملف الشخصي
              </button>

              {showSaveSuccess && (
                <div className="text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-pulse flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 animate-bounce" />
                  <span>تم حفظ ملفك الشخصي وعناوينك محلياً بنجاح!</span>
                </div>
              )}
            </div>
          </form>
        </section>

        {/* Data Management Settings block */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-500" />
            <span>إدارة البيانات والتخزين والنسخ الاحتياطي</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            يتم تخزين كافة التغييرات والقصص محلياً في متصفحك بشكل آمن ومستمر عبر تقنيات التخزين الحديثة. لا يتم نقل بياناتك إلى أي خوادم خارجية تماماً.
          </p>

          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl mb-6">
            <div className="text-right">
              <span className="text-xs text-slate-400 dark:text-slate-500 block">إحصاءات النظام المحلي</span>
              <div className="flex gap-4 mt-1 text-sm text-slate-700 dark:text-slate-300 font-semibold">
                <span>المجلدات: <strong className="text-indigo-600 dark:text-indigo-400">{folders.length}</strong></span>
                <span>القصص والنصوص: <strong className="text-indigo-600 dark:text-indigo-400">{stories.length}</strong></span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg text-xs font-semibold self-start md:self-auto">
              <ShieldCheck className="w-4 h-4" />
              <span>البيانات مؤمنة محلياً</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportData}
              className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 text-sm font-semibold bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              تصدير نسخة احتياطية (JSON)
            </button>
            
            <div className="flex-1 min-w-[150px]">
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleImportData}
                style={{ display: 'none' }}
                id="import-backup-file"
              />
              <label
                htmlFor="import-backup-file"
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 dark:text-slate-300 dark:hover:text-indigo-400 px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm text-center"
              >
                <Upload className="w-4 h-4" />
                استيراد نسخة احتياطية
              </label>
            </div>

            <button
              onClick={handleClearData}
              className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 text-sm font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/10 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Trash className="w-4 h-4" />
              تصفير كافة البيانات
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
