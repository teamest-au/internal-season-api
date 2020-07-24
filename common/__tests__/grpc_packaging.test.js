const google_protobuf_wrappers_pb = require('google-protobuf/google/protobuf/wrappers_pb');

const GrpcPackaging = require('../grpc_packaging');
const GrpcTypes = require('../grpc-types/season_pb');

describe('grpc_packaging', () => {
  describe('optional string', () => {
    it('must correctly package and unpackage optional string (with value)', async () => {
      const value = 'test';

      const packaged = GrpcPackaging.packageOptionalString(value);

      expect(packaged).toBeInstanceOf(google_protobuf_wrappers_pb.StringValue);

      const actual = GrpcPackaging.unpackageOptionalString(packaged);

      expect(actual).toEqual(value);
    });
    it('must correctly package and unpackage optional string (without value)', async () => {
      const value = undefined;

      const packaged = GrpcPackaging.packageOptionalString(value);

      expect(packaged).toBe(undefined);

      const actual = GrpcPackaging.unpackageOptionalString(packaged);

      expect(actual).toEqual(value);
    });
  });
  describe('time', () => {
    it('must correctly package and unpackage time', async () => {
      const time = new Date('2020-02-05T16:45:56');

      const packaged = GrpcPackaging.packageTime(time);

      expect(typeof packaged).toBe('string');

      const actual = GrpcPackaging.unpackageTime(packaged);

      expect(actual).toEqual(time);
    });
  });
  describe('team', () => {
    it('must correctly package and unpackage team model', async () => {
      const teamModel = {
        name: 'Test',
        isExternal: true,
      };

      const packaged = GrpcPackaging.packageTeam(teamModel);

      expect(packaged).toBeInstanceOf(GrpcTypes.Team);

      const actual = GrpcPackaging.unpackageTeam(packaged);

      expect(actual).toEqual(teamModel);
    });
  });
  describe('eventType', () => {
    it('must correctly package and unpackage event type', async () => {
      const eventType = 'duty';

      const packaged = GrpcPackaging.packageEventType(eventType);

      expect(typeof packaged).toBe('number');

      const actual = GrpcPackaging.unpackageEventType(packaged);

      expect(actual).toEqual(eventType);
    });
  });
  describe('event', () => {
    describe('match', () => {
      it('must correctly package and unpackage match event model', async () => {
        const matchModel = {
          type: 'match',
          time: new Date('2020-01-01'),
          court: 'Court 1',
          venue: 'Large Venue',
          home: {
            name: 'Home Team',
            isExternal: false,
          },
          away: {
            name: 'Away Team',
            isExternal: false,
          },
          duty: {
            name: 'Duty Team',
            isExternal: false,
          },
          round: 'Round 1',
        };

        const packaged = GrpcPackaging.packageEvent(matchModel);

        expect(packaged).toBeInstanceOf(GrpcTypes.EventWrapper);

        const actual = GrpcPackaging.unpackageEvent(packaged);

        expect(actual).toEqual(matchModel);
      });
      it('must correctly package and unpackage match event model with optional fields not set', async () => {
        const matchModel = {
          type: 'duty',
          time: new Date('2020-01-01'),
          home: {
            name: 'Home Team',
            isExternal: false,
          },
          away: {
            name: 'Away Team',
            isExternal: false,
          },
        };

        const packaged = GrpcPackaging.packageEvent(matchModel);

        expect(packaged).toBeInstanceOf(GrpcTypes.EventWrapper);

        const actual = GrpcPackaging.unpackageEvent(packaged);

        expect(actual).toEqual(matchModel);
      });
    });
    describe('duty', () => {
      it('must correctly package and unpackage duty event model', async () => {
        const dutyModel = {
          type: 'duty',
          time: new Date('2020-01-01'),
          court: 'Court 1',
          venue: 'Large Venue',
          home: {
            name: 'Home Team',
            isExternal: false,
          },
          away: {
            name: 'Away Team',
            isExternal: false,
          },
          duty: {
            name: 'Duty Team',
            isExternal: false,
          },
          round: 'Round 1',
        };

        const packaged = GrpcPackaging.packageEvent(dutyModel);

        expect(packaged).toBeInstanceOf(GrpcTypes.EventWrapper);

        const actual = GrpcPackaging.unpackageEvent(packaged);

        expect(actual).toEqual(dutyModel);
      });
      it('must correctly package and unpackage duty event model with optional fields not set', async () => {
        const dutyModel = {
          type: 'duty',
          time: new Date('2020-01-01'),
          duty: {
            name: 'Duty Team',
            isExternal: false,
          },
        };

        const packaged = GrpcPackaging.packageEvent(dutyModel);

        expect(packaged).toBeInstanceOf(GrpcTypes.EventWrapper);

        const actual = GrpcPackaging.unpackageEvent(packaged);

        expect(actual).toEqual(dutyModel);
      });
    });
  });
});
