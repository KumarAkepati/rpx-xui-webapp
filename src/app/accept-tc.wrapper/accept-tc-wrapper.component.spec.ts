import { AcceptTcWrapperComponent } from '../components';
import { Subscription } from 'rxjs';
import { Action } from '@ngrx/store';

describe('Accept Tc Wrapper Component', () => {
    let component: AcceptTcWrapperComponent;
    let mockStore: any;
    let mockService: any;
    let mockActions: any;

    class TestAction implements Action {
        type: string;
    }

    beforeEach(() => {
        mockStore = jasmine.createSpyObj('mockStore', ['unsubscribe', 'dispatch']);
        mockService = jasmine.createSpyObj('mockService', ['get']);
        mockActions = jasmine.createSpyObj('mockActions', ['pipe']);
        component = new AcceptTcWrapperComponent(mockStore, mockService, mockActions);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should unsubscribe', () => {
        const subscription = jasmine.createSpyObj('subscription', ['unsubscribe']);
        component.unsubscribe(subscription);
        expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('should dispatchAction', () => {
        const action = new TestAction();
        component.dispatchAction(mockStore, action);
        expect(mockStore.dispatch).toHaveBeenCalledWith(action);
    });
});
