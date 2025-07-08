import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/roles';
import { Layout } from '@/components/layout/Layout';
import { PlatformMission } from '@/components/about/PlatformMission';
import { FounderSection } from '@/components/about/FounderSection';
import { PrinciplesSection } from '@/components/about/PrinciplesSection';
import { ExpertTeam } from '@/components/about/ExpertTeam';
import { TechnologiesSection } from '@/components/about/TechnologiesSection';
import { AchievementsSection } from '@/components/about/AchievementsSection';
import { ContactsSection } from '@/components/about/ContactsSection';
import { useAboutPlatformData } from '@/hooks/useAboutPlatformData';
import { Button } from '@/components/ui/button';
import { Edit3, Eye } from 'lucide-react';

const AboutPlatform = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { aboutData, updateData, isLoading } = useAboutPlatformData();
  const isAdmin = user?.role === UserRole.ADMIN;

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header с кнопкой редактирования для админов */}
          {isAdmin && (
            <div className="flex justify-end mb-6">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "default" : "outline"}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isEditing ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Просмотр
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Редактировать
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Все разделы страницы */}
          <PlatformMission 
            data={aboutData.mission} 
            isEditing={isEditing && isAdmin}
            onUpdate={(field, value) => updateData(`mission.${field}`, value)}
          />
          
          <FounderSection 
            data={aboutData.founder} 
            isEditing={isEditing && isAdmin}
            onUpdate={(field, value) => updateData(`founder.${field}`, value)}
          />
          
          <PrinciplesSection 
            data={aboutData.principles} 
            isEditing={isEditing && isAdmin}
            onUpdate={(field, value) => updateData(`principles.${field}`, value)}
          />
          
          <ExpertTeam 
            data={aboutData.experts} 
            isEditing={isEditing && isAdmin}
            onUpdate={(experts) => updateData('experts', experts)}
          />
          
          <TechnologiesSection 
            data={aboutData.technologies} 
            isEditing={isEditing && isAdmin}
            onUpdate={(field, value) => updateData(`technologies.${field}`, value)}
          />
          
          <AchievementsSection 
            data={aboutData.achievements} 
            isEditing={isEditing && isAdmin}
            onUpdate={(field, value) => updateData(`achievements.${field}`, value)}
          />
          
          <ContactsSection 
            data={aboutData.contacts} 
            isEditing={isEditing && isAdmin}
            onUpdate={(field, value) => updateData(`contacts.${field}`, value)}
          />
        </div>
      </div>
    </Layout>
  );
};

export default AboutPlatform;