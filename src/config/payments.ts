import type {Plan} from '../data';

// A selected offer is only checkout intent. Never infer paid access from this map.
export const CHECKOUT_URLS:Record<Plan,string>={
 Pro:'https://buy.stripe.com/8x200i22E1WgaeV4C167S0w',
 Enseignant:'https://buy.stripe.com/eVq14m5eQ6cwfzfgkJ67S0z',
 Pédagogue:'https://buy.stripe.com/eVq14m5eQ6cwfzfgkJ67S0z',
 Étudiant:'https://buy.stripe.com/eVq8wOdLmdEY3Qxc4t67S0y',
};
