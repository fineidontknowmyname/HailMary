// Scoring service - ranks resources and paths
export class Scorer {
  scoreResource(resource: any, userProfile: any) {
    let score = 0;

    if (resource.difficulty === userProfile.level) score += 2;
    if (resource.category === userProfile.preferredCategory) score += 1.5;

    return score;
  }

  scorePath(path: any, userProfile: any) {
    const resourceScores = path.resources.map((r: any) =>
      this.scoreResource(r, userProfile)
    );

    return resourceScores.reduce((a: number, b: number) => a + b, 0) / resourceScores.length;
  }

  rankResources(resources: any[], userProfile: any) {
    return resources
      .map(r => ({ ...r, score: this.scoreResource(r, userProfile) }))
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...r }) => r);
  }
}

export const scorer = new Scorer();
