import React, { useState, useEffect } from 'react';
import { ProjectTimeline } from '../../../components/timeline/ProjectTimeline';
import { projectService } from '../../../services/projectService';
import { LoadingState } from '../../../components/common/LoadingState';

export const ProjectTimelineTab = ({ project }) => {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const res = await projectService.getProjectTimeline(project._id);
        if (res.success) {
          setTimelineData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (project?._id) fetchTimeline();
  }, [project?._id]);

  if (loading) {
    return <LoadingState message="Compiling roadmap timeline..." />;
  }

  return (
    <div className="animate-fade-in">
      <ProjectTimeline
        project={project}
        milestones={timelineData?.milestones || []}
        sprints={timelineData?.sprints || []}
      />
    </div>
  );
};
