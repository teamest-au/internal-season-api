import {
  TeamSeason as GrpcTeamSeason,
  UpdateTeamSeasonResult as GrpcUpdateTeamSeasonResult,
} from './season_pb';

export default {
  updateTeamSeason: async function (
    teamSeason: GrpcTeamSeason,
  ): Promise<GrpcUpdateTeamSeasonResult> {
    const result = new GrpcUpdateTeamSeasonResult();

    result.setSeasonName(teamSeason.getSeasonName());
    result.setTeamName(teamSeason.getTeamName());
    result.setTeamSeasonId('some-fake-uuid');
    result.setWasModified(false);

    return result;
  },
};
