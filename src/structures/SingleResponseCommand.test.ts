import SingleResponseCommand from './SingleResponseCommand';

const response = 'response';
const description = 'description';
const aliases = ['alias'];

class TestCommand extends SingleResponseCommand {
	constructor() {
		super('id', {
			response,
			description,
			aliases
		});
	}
}

test('SingleResponseCommand', () => {
	const testCommand = new TestCommand();
	const mockResponseFn = jest.fn();

	// @ts-ignore
	testCommand.exec({util: {send: mockResponseFn}});
	expect(mockResponseFn).toBeCalledWith(response);

	expect(testCommand.aliases).toEqual(expect.arrayContaining(aliases));

	expect(testCommand.description.content).toBe(description);
});
