import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  headline?: string;
  location?: string;
  website?: string;
  github?: string;
  summary?: string;
}

interface ResumePDFProps {
  personal: PersonalInfo;
  skills: any[];
  experiences: any[];
  projects: any[];
  education: any[];
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
  },
  header: {
    marginBottom: 10,
    textAlign: 'center',
  },
  name: {
    fontSize: 20,
    marginBottom: 5,
    fontWeight: 'light',
  },
  contact: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 5,
    color: '#444',
  },
  summary: {
    marginTop: 5,
    marginBottom: 10,
    fontSize: 8,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 2,
    textTransform: 'uppercase',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  itemSubtitle: {
    fontSize: 10,
    color: '#444',
  },
  itemDate: {
    fontSize: 8,
    color: '#666',
  },
  bulletList: {
    paddingLeft: 15,
  },
  bullet: {
    fontSize: 9,
    color: '#444',
    marginBottom: 2,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skill: {
    fontSize: 9,
    color: '#444',
  },
  headline: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default function ResumePDF({ personal, skills, experiences, projects, education }: ResumePDFProps) {
  const website = personal.website;
  const github = personal.github;
  const summary = personal.summary;

  // Helper function to check if a section has valid content
  const hasValidContent = (section: any[]): boolean => {
    return section.length > 0 && section.some(item => {
      if ('description' in item) {
        return item.description?.trim().length > 0;
      }
      if ('name' in item) {
        return item.name?.trim().length > 0;
      }
      return true;
    });
  };

  // Check which sections have content
  const hasEducation = hasValidContent(education);
  const hasExperiences = hasValidContent(experiences);
  const hasProjects = hasValidContent(projects);
  const hasSkills = skills.length > 0;

  return (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{personal?.name}</Text>
          {personal?.headline && (
            <Text style={styles.headline}>{personal.headline}</Text>
          )}
          <Text style={styles.contact}>
            {personal?.email}
            {personal?.location && personal.email && " • "}
            {personal?.location}
          </Text>
          {personal.phone && <Text style={{ textAlign: 'center', color: '#444' }}>{personal.phone}</Text>}
          {summary && <Text style={styles.summary}>{summary}</Text>}
      </View>

      {/* Education */}
        {hasEducation && (
          <>
            <Text style={styles.sectionHeader}>Education</Text>
            {education.map((edu: any, index: number) => (
              edu.degree && edu.institution && (
                <View key={index} style={{ marginBottom: 5 }}>
                  <View style={styles.itemHeader}>
                    <View>
                      <Text style={styles.itemTitle}>{edu.degree}</Text>
                      <Text style={styles.itemSubtitle}>{edu.institution}</Text>
              </View>
                    {edu.year && <Text style={styles.itemDate}>{edu.year}</Text>}
            </View>
          </View>
              )
        ))}
          </>
        )}

      {/* Professional Experience */}
        {hasExperiences && (
          <>
            <Text style={styles.sectionHeader}>Professional Experience</Text>
            {experiences.map((exp: any, index: number) => (
              exp.position && exp.company && (
                <View key={index} style={{ marginBottom: 10 }}>
                  <View style={styles.itemHeader}>
                    <View>
                      <Text style={styles.itemTitle}>{exp.position}</Text>
                      <Text style={styles.itemSubtitle}>{exp.company}</Text>
              </View>
                    <Text style={styles.itemDate}>
                      {exp.location && `${exp.location}, `}
                      {exp.dates || exp.duration}
              </Text>
            </View>
            {exp.bullets ? (
                    <View style={styles.bulletList}>
                      {exp.bullets.map((bullet: string, i: number) => (
                        bullet.trim() && <Text key={i} style={styles.bullet}>• {bullet}</Text>
                      ))}
              </View>
            ) : exp.description && (
                    <View style={styles.bulletList}>
                      {exp.description.split('\n').map((line: string, i: number) => (
                        line.trim() && <Text key={i} style={styles.bullet}>• {line}</Text>
                      ))}
              </View>
            )}
          </View>
              )
        ))}
          </>
        )}

      {/* Projects */}
        {hasProjects && (
          <>
            <Text style={styles.sectionHeader}>Projects</Text>
            {projects.map((project: any, index: number) => (
              project.name && (
                <View key={index} style={{ marginBottom: 10 }}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{project.name}</Text>
                    {project.dates && <Text style={styles.itemDate}>{project.dates}</Text>}
                  </View>
            {project.bullets ? (
                    <View style={styles.bulletList}>
                      {project.bullets.map((bullet: string, i: number) => (
                        bullet.trim() && <Text key={i} style={styles.bullet}>• {bullet}</Text>
                      ))}
              </View>
            ) : project.description && (
                    <View style={styles.bulletList}>
                      {project.description.split('\n').map((line: string, i: number) => (
                        line.trim() && <Text key={i} style={styles.bullet}>• {line}</Text>
                      ))}
              </View>
            )}
            {project.tech_stack && (
                    <Text style={{ fontSize: 8, color: '#666', marginTop: 3 }}>
                      Tech Stack: {project.tech_stack}
                    </Text>
            )}
          </View>
              )
        ))}
          </>
        )}

      {/* Skills */}
        {hasSkills && (
          <>
            <Text style={styles.sectionHeader}>Skills</Text>
            <View style={styles.skillsContainer}>
              {skills.map((skill: any, index: number) => (
                skill.name && <Text key={index} style={styles.skill}>{skill.name}</Text>
              ))}
      </View>
          </>
        )}
    </Page>
  </Document>
);
} 