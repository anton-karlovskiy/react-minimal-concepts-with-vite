import * as React from "react";

/**
 * LoadingDemo - Status enum over isLoading booleans
 *
 * KEY CONCEPTS:
 * 1. Replace isLoading-style booleans with a single finite "status" value
 *    - Avoids impossible states (e.g., loading + error + data at once)
 *    - Makes UI rendering unambiguous (idle | pending | resolved | rejected)
 *
 * 2. Reducer-driven state transitions
 *    - Actions move the state machine between finite states
 *    - Keeps error/position updates consistent with the current status
 *
 * 3. Based on Kent C. Dodds' article: Stop using isLoading booleans
 *    - See: https://kentcdodds.com/blog/stop-using-isloading-booleans
 */

interface GeoPositionState {
  status: 'idle' | 'pending' | 'resolved' | 'rejected';
  position: GeolocationPosition | null;
  error: Error | GeolocationPositionError | null;
}

type GeoPositionAction =
  | { type: 'error'; error: Error | GeolocationPositionError; }
  | { type: 'success'; position: GeolocationPosition; }
  | { type: 'start'; }

function geoPositionReducer(state: GeoPositionState, action: GeoPositionAction): GeoPositionState {
  switch (action.type) {
    case 'error': {
      return {
        ...state,
        status: 'rejected',
        error: action.error,
      }
    }
    case 'success': {
      return {
        ...state,
        status: 'resolved',
        position: action.position,
      }
    }
    case 'start': {
      return {
        ...state,
        status: 'pending',
      }
    }
    default: {
      throw new Error(`Unhandled action type: ${(action as GeoPositionAction).type}`)
    }
  }
}

function useGeoPosition() {
  const [state, dispatch] = React.useReducer(geoPositionReducer, {
    status: 'idle',
    position: null,
    error: null,
  })

  React.useEffect(() => {
    if (!navigator.geolocation) {
      dispatch({
        type: 'error',
        error: new Error('Geolocation is not supported'),
      })
      return
    }
    dispatch({type: 'start'})
    const geoWatch = navigator.geolocation.watchPosition(
      position => dispatch({type: 'success', position}),
      error => dispatch({type: 'error', error}),
    )
    return () => navigator.geolocation.clearWatch(geoWatch)
  }, [])

  return state
}

function YourPosition() {
  const {status, position, error} = useGeoPosition()

  if (status === 'idle' || status === 'pending') {
    return <div>Loading your position...</div>
  }

  if (status === 'resolved') {
    if (!position) {
      throw new Error('Position is null')
    }

    return (
      <div>
        Lat: {position.coords.latitude}, Long: {position.coords.longitude}
      </div>
    )
  }

  if (status === 'rejected') {
    if (!error) {
      throw new Error('Error is null')
    }
    
    return (
      <div>
        <div>Oh no, there was a problem getting your position:</div>
        <pre>{error.message}</pre>
      </div>
    )
  }
}

function LoadingDemo() {
  return (
    <YourPosition />
  )
}

export default LoadingDemo