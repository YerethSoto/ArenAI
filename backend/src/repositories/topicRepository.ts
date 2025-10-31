import { db } from '../db/pool.js';
import type { Topic } from '../types.js';

export interface TopicResource {
  id_topic_resource: number;
  id_topic: number;
  resource_source: string;
  description: string | null;
  resource_quality: string | null;
}

export async function listTopicsBySubject(subjectId: number) {
  const result = await db.query<Topic>(
    `SELECT id_topic, name, id_subject, description
     FROM topic
     WHERE id_subject = $1
     ORDER BY name`,
    [subjectId]
  );

  return result.rows;
}

export async function createTopic(payload: { name: string; subjectId: number; description?: string | null }) {
  const result = await db.query<Topic>(
    `INSERT INTO topic (name, id_subject, description)
     VALUES ($1, $2, $3)
     RETURNING id_topic, name, id_subject, description`,
    [payload.name, payload.subjectId, payload.description ?? null]
  );

  return result.rows[0];
}

export async function createTopicRelation(payload: { fatherId: number; sonId: number; correlation?: number | null }) {
  const result = await db.query<{ id_topic_father_son_relation: number }>(
    `INSERT INTO topic_father_son_relation (id_topic_father, id_topic_son, correlation_coefficient)
     VALUES ($1, $2, $3)
     RETURNING id_topic_father_son_relation`,
    [payload.fatherId, payload.sonId, payload.correlation ?? null]
  );

  return result.rows[0];
}

export async function createTopicResource(payload: { topicId: number; source: string; description?: string | null; quality?: number | null }) {
  const result = await db.query<TopicResource>(
    `INSERT INTO topic_resource (id_topic, resource_source, description, resource_quality)
     VALUES ($1, $2, $3, $4)
     RETURNING id_topic_resource, id_topic, resource_source, description, resource_quality`,
    [payload.topicId, payload.source, payload.description ?? null, payload.quality ?? null]
  );

  return result.rows[0];
}

export async function listTopicResources(topicId: number) {
  const result = await db.query<TopicResource>(
    `SELECT id_topic_resource, id_topic, resource_source, description, resource_quality
     FROM topic_resource
     WHERE id_topic = $1
     ORDER BY id_topic_resource`,
    [topicId]
  );

  return result.rows;
}
