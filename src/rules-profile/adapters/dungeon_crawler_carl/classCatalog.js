/* Partial Third-Floor class catalog — add entries only from supplied/verified
   class data. Class benefits are stored as DELTAS/effects so applying a class
   later never replaces a crawler's existing ranks or stats. */

export const THIRD_FLOOR_CLASS_CATALOG = {
  health_embezzeler: {
    id: "health_embezzeler",
    name: "Health Embezzeler",
    class_type: "Earth Class",
    source_stage: "third_floor",
    description:
      "The twisted mix of a vampire fangirl and a corporate criminal: unlike your usual goodie two shoes healer, the Health Embezzeler knows that the best things in life are the things that they don't have to pay for. After all, why spend resources on traditional healing spells when there are perfectly good health points right there just waiting to be... \"reallocated\". Like the insidious parasites you emulated in corporate, you're hard to get rid of. And when the going gets tough, you can justify your stinginess by telling yourself that horrifically draining the lives of your victims was all just to conserve your strength so that you could cast those \"proper\" healing spells when you truly needed them.",
    stat_bonuses: {
      int: 1,
      con: 1,
    },
    skill_rank_bonuses: {
      drain_life: 2,
      heal_others: 2,
      heal_self: 1,
      cockroach: 1,
    },
    effects: [
      {
        id: "healing_spell_extra_health_bar",
        trigger: "healing_type_spell",
        target_heals_additional_health_bars: 1,
        text: "When you use a Healing-type Spell, the target heals 1 additional Health Bar.",
      },
      {
        id: "double_mana_regeneration",
        mana_regeneration_multiplier: 2,
        text: "Your Mana regeneration rate is doubled.",
      },
    ],
    granted_skills: [
      {
        id: "draining_shadows",
        name: "Draining Shadows",
        rank_rule: {
          kind: "floor_level",
          initial_rank_at_third_floor: 3,
        },
        attack: {
          range: "melee",
          attack_stat: "int",
          damage: {
            dice: "1d8",
            plus_mod_stat: "int",
            damage_type: "Necrotic",
            extra_d8_at_ranks: [5, 10, 15],
          },
        },
        self_heal: {
          on_damage: true,
          health_bars: 1,
          max_uses_per_combat: 5,
        },
        text:
          "You gain the ability to manifest shadowy tendrils that can drain the life of a nearby target. Make a melee attack using Intelligence that deals 1d8 + Int necrotic damage. Add another d8 at Rank 5, 10, and 15. The rank of this skill is equal to the floor level, and only increases by floor. When you deal damage to a creature using this skill, you can heal one of your health bars. You can heal yourself in this way up to 5 times per combat.",
      },
    ],
    passive_skills: [
      {
        id: "reallocate",
        name: "Reallocate",
        trigger: "deal_necrotic_damage",
        target: {
          self_allowed: false,
          range_feet: 30,
        },
        heal_health_bars: 1,
        text:
          "Whenever you deal necrotic damage to a creature, you can heal 1 health bar to a creature other than yourself within 30ft of you.",
      },
    ],
  },
};
