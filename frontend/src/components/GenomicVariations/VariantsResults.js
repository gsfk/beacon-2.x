import './GenomicVariations.css'
import '../Individuals/Individuals.css'
import '../../App.css'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from 'oidc-react'
import configData from '../../config.json'
import { AuthContext } from '../context/AuthContext'
import { useContext } from 'react'
import TableResultsVariant from '../Results/VariantResults/TableResultsVariant'

function VariantsResults (props) {
  const [error, setError] = useState('')
  const [timeOut, setTimeOut] = useState(false)
  const [logInRequired, setLoginRequired] = useState(false)
  const [messageLoginCount, setMessageLoginCount] = useState('')
  const [messageLoginFullResp, setMessageLoginFullResp] = useState('')
  const [results, setResults] = useState([])
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [show3, setShow3] = useState(false)

  const [numberResults, setNumberResults] = useState(0)
  const [boolean, setBoolean] = useState(false)
  const [arrayFilter, setArrayFilter] = useState([])
  const [queryArray, setQueryArray] = useState([])
  const [beaconsList, setBeaconsList] = useState([])

  const [limit, setLimit] = useState(0)
  const [skip, setSkip] = useState(0)

  const [showVariantsResults, setShowVariantsResults] = useState(false)

  const { getStoredToken, authenticateUser } = useContext(AuthContext)

  const [resultsPerDataset, setResultsDataset] = useState([])
  const [resultsNotPerDataset, setResultsNotPerDataset] = useState([])

  let queryStringTerm = ''
  const handleTypeResults1 = () => {
    setShow1(true)
    setShow2(false)
    setShow3(false)
  }

  const handleTypeResults2 = () => {
    setShow2(true)
    setShow1(false)
    setShow3(false)
  }

  const handleTypeResults3 = () => {
    setShow3(true)
    setShow1(false)
    setShow2(false)
  }

  const auth = useAuth()
  let isAuthenticated = auth.userData?.id_token ? true : false

  useEffect(() => {
    const apiCall = async () => {
      if (isAuthenticated === false) {
        authenticateUser()
        const token = getStoredToken()

        if (token !== 'undefined' && token !== null) {
          isAuthenticated = true
        }
      }

      try {
        let res = await axios.get(configData.API_URL + '/info')

        beaconsList.push(res.data.response)

        if (props.showBar === false) {
          setShowVariantsResults(true)
          if (props.query !== null) {
            if (props.query.includes(',')) {
              queryStringTerm = props.query.split(',')
              queryStringTerm.forEach((element, index) => {
                element = element.trim()
                if (
                  element.includes('=') ||
                  element.includes('>') ||
                  element.includes('<') ||
                  element.includes('!') ||
                  element.includes('%')
                ) {
                  if (element.includes('=')) {
                    queryArray[index] = element.split('=')
                    queryArray[index].push('=')
                  } else if (element.includes('>')) {
                    queryArray[index] = element.split('>')
                    queryArray[index].push('>')
                  } else if (element.includes('<')) {
                    queryArray[index] = element.split('<')
                    queryArray[index].push('<')
                  } else if (element.includes('!')) {
                    queryArray[index] = element.split('!')
                    queryArray[index].push('!')
                  } else {
                    queryArray[index] = element.split('%')
                    queryArray[index].push('%')
                  }
                  const alphaNumFilter = {
                    id: queryArray[index][0],
                    operator: queryArray[index][2],
                    value: queryArray[index][1]
                  }
                  arrayFilter.push(alphaNumFilter)
                } else {
                  const filter2 = {
                    id: element,
                    includeDescendantTerms: props.descendantTerm
                  }
                  arrayFilter.push(filter2)
                }
              })
            } else {
              if (
                props.query.includes('=') ||
                props.query.includes('>') ||
                props.query.includes('<') ||
                props.query.includes('!') ||
                props.query.includes('%')
              ) {
                if (props.query.includes('=')) {
                  queryArray[0] = props.query.split('=')
                  queryArray[0].push('=')
                } else if (props.query.includes('>')) {
                  queryArray[0] = props.query.split('>')
                  queryArray[0].push('>')
                } else if (props.query.includes('<')) {
                  queryArray[0] = props.query.split('<')
                  queryArray[0].push('<')
                } else if (props.query.includes('!')) {
                  queryArray[0] = props.query.split('!')
                  queryArray[0].push('!')
                } else {
                  queryArray[0] = props.query.split('%')
                  queryArray[0].push('%')
                }

                const alphaNumFilter = {
                  id: queryArray[0][0],
                  operator: queryArray[0][2],
                  value: queryArray[0][1]
                }
                arrayFilter.push(alphaNumFilter)
              } else {
                const filter = {
                  id: props.query
                }
                arrayFilter.push(filter)
              }
            }
          }

          if (props.query === null) {
            // show all individuals

            var jsonData1 = {
              meta: {
                apiVersion: '2.0'
              },
              query: {
                filters: arrayFilter,
                includeResultsetResponses: `${props.resultSets}`,
                pagination: {
                  skip: skip,
                  limit: limit
                },
                testMode: false,
                requestedGranularity: 'record'
              }
            }
            jsonData1 = JSON.stringify(jsonData1)

            let token = null
            if (auth.userData === null) {
              token = getStoredToken()
            } else {
              token = auth.userData.access_token
            }

            if (token === null) {
              res = await axios.post(
                configData.API_URL + '/g_variants',
                jsonData1
              )
              // Object.defineProperty(res.data.response.resultSets[0], 'beaconId', {
              //  value: 'es.chipdb.cnic.beacon'
              //})
            } else {
              const headers = { Authorization: `Bearer ${token}` }

              res = await axios.post(
                configData.API_URL + '/g_variants',
                jsonData1,
                { headers: headers }
              )
            }
            setTimeOut(true)

            if (
              res.data.responseSummary.numTotalResults < 1 ||
              res.data.responseSummary.numTotalResults === undefined
            ) {
              setError('ERROR. Please check the query and retry')
              setNumberResults(0)
              setBoolean(false)
            } else {
              res.data.response.resultSets.forEach((element, index) => {
                if (element.id && element.id !== '') {
                  if (resultsPerDataset.length > 0) {
                    resultsPerDataset.forEach(element2 => {
                      element2[0].push(element.id)
                      element2[1].push(element.exists)
                      element2[2].push(element.resultsCount)
                    })
                  } else {
                    let arrayResultsPerDataset = [
                      //element.beaconId,
                      [element.id],
                      [element.exists],
                      [element.resultsCount]
                    ]

                    resultsPerDataset.push(arrayResultsPerDataset)
                  }
                }

                if (element.id === undefined || element.id === '') {
                  let arrayResultsNoDatasets = [element.beaconId]
                  resultsNotPerDataset.push(arrayResultsNoDatasets)
                }

                if (res.data.response.resultSets[index].results) {
                  res.data.response.resultSets[index].results.forEach(
                    (element2, index2) => {
                      let arrayResult = [
                        res.data.meta.beaconId,
                        res.data.response.resultSets[index].results[index2]
                      ]
                      results.push(arrayResult)
                    }
                  )
                }
              })
            }
          }
        } else {
          setShowVariantsResults(true)

          //   referenceName={referenceName} start={start} end={end} variantType={variantType} alternateBases={alternateBases} referenceBases={referenceBases} aminoacid={aminoacid} geneID={geneID} />
          //    </div>

          var requestParametersSequence = {}
          var requestParametersRange = {}
          var requestParametersGene = {}
          if (props.referenceName !== '') {
            requestParametersSequence['referenceName'] = props.referenceName
          }
          if (props.referenceName2 !== '') {
            requestParametersRange['referenceName'] = props.referenceName2
          }
          if (props.start !== '') {
            requestParametersSequence['start'] = props.start
          }
          if (props.start2 !== '') {
            requestParametersRange['start'] = props.start2
          }
          if (props.variantMinLength !== '') {
            requestParametersRange['variantMinLength'] = props.variantMinLength
          }
          if (props.variantMaxLength !== '') {
            requestParametersRange['variantMaxLength'] = props.variantMaxLength
          }
          if (props.variantMinLength2 !== '') {
            requestParametersGene['variantMinLength'] = props.variantMinLength2
          }
          if (props.variantMaxLength2 !== '') {
            requestParametersGene['variantMaxLength'] = props.variantMaxLength2
          }
          if (props.end !== '') {
            requestParametersRange['end'] = props.end
          }
          if (props.variantType !== '') {
            requestParametersRange['variantType'] = props.variantType
          }
          if (props.variantType2 !== '') {
            requestParametersGene['variantType'] = props.variantType2
          }
          if (props.alternateBases !== '') {
            requestParametersSequence['alternateBases'] = props.alternateBases
          }
          if (props.alternateBases2 !== '') {
            requestParametersRange['alternateBases'] = props.alternateBases2
          }
          if (props.referenceBases !== '') {
            requestParametersSequence['referenceBases'] = props.referenceBases
          }
          if (props.referenceBases2 !== '') {
            requestParametersRange['referenceBases'] = props.referenceBases2
          }
          if (props.aminoacid !== '') {
            requestParametersSequence['aminoacidChange'] = props.aminoacid
          }
          if (props.aminoacid2 !== '') {
            requestParametersRange['aminoacidChange'] = props.aminoacid2
          }
          if (props.geneID !== '') {
            requestParametersGene['geneId'] = props.geneID
          }
          if (props.assemblyId !== '') {
            requestParametersSequence['assemblyId'] = props.assemblyId
          }
          if (props.assemblyId2 !== '') {
            requestParametersRange['assemblyId'] = props.assemblyId2
          }
          if (props.assemblyId3 !== '') {
            requestParametersGene['assemblyId'] = props.assemblyId3
          }

          var jsonData1 = {}

          if (props.sequenceSubmitted) {
            jsonData1 = {
              meta: {
                apiVersion: '2.0'
              },
              query: {
                requestParameters: requestParametersSequence,
                filters: [],
                includeResultsetResponses: `${props.resultSets}`,
                pagination: {
                  skip: skip,
                  limit: limit
                },
                testMode: false,
                requestedGranularity: 'record'
              }
            }
          }

          if (props.rangeSubmitted) {
            jsonData1 = {
              meta: {
                apiVersion: '2.0'
              },
              query: {
                requestParameters: requestParametersRange,
                filters: [],
                includeResultsetResponses: `${props.resultSets}`,
                pagination: {
                  skip: skip,
                  limit: limit
                },
                testMode: false,
                requestedGranularity: 'record'
              }
            }
          }

          if (props.geneSubmitted) {
            jsonData1 = {
              meta: {
                apiVersion: '2.0'
              },
              query: {
                requestParameters: requestParametersGene,
                filters: [],
                includeResultsetResponses: `${props.resultSets}`,
                pagination: {
                  skip: skip,
                  limit: limit
                },
                testMode: false,
                requestedGranularity: 'record'
              }
            }
          }

          jsonData1 = JSON.stringify(jsonData1)

          let token = null
          if (auth.userData === null) {
            token = getStoredToken()
          } else {
            token = auth.userData.access_token
          }

          if (token === null) {
            console.log('Querying without token')

            res = await axios.post(
              configData.API_URL + '/g_variants',
              jsonData1
            )
          } else {
            const headers = { Authorization: `Bearer ${token}` }
            res = await axios.post(
              configData.API_URL + '/g_variants',
              jsonData1,
              { headers: headers }
            )
          }

          setTimeOut(true)
          if (
            res.data.responseSummary.numTotalResults < 1 ||
            res.data.responseSummary.numTotalResults === undefined
          ) {
            setError('ERROR. Please check the query and retry')
            setNumberResults(0)
            setBoolean(false)
          } else {
            res.data.response.resultSets.forEach((element, index) => {
              if (element.id && element.id !== '') {
                if (resultsPerDataset.length > 0) {
                  resultsPerDataset.forEach(element2 => {
                    element2[0].push(element.id)
                    element2[1].push(element.exists)
                    element2[2].push(element.resultsCount)
                  })
                } else {
                  let arrayResultsPerDataset = [
                    //element.beaconId,
                    [element.id],
                    [element.exists],
                    [element.resultsCount]
                  ]
                  resultsPerDataset.push(arrayResultsPerDataset)
                }
              }

              if (element.id === undefined || element.id === '') {
                let arrayResultsNoDatasets = [element.beaconId]
                resultsNotPerDataset.push(arrayResultsNoDatasets)
              }

              if (res.data.response.resultSets[index].results) {
                res.data.response.resultSets[index].results.forEach(
                  (element2, index2) => {
                    let arrayResult = [
                      res.data.meta.beaconId,
                      res.data.response.resultSets[index].results[index2]
                    ]
                    results.push(arrayResult)
                  }
                )
              }
            })
          }
        }
      } catch (error) {
        setError('Connection error. Please retry')
        setTimeOut(true)
      }
    }
    apiCall()
  }, [props.showBar])
  return (
    <div>
      {showVariantsResults === true && (
        <div className='resultsOptions'>
          {timeOut === false && (
            <div className='loaderLogo'>
              <div className='loader2'>
                <div id='ld3'>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            </div>
          )}
          {timeOut && error !== 'Connection error. Please retry' && (
            <div>
              <div className='selectGranularity'>
                <h4>Granularity:</h4>
                <button className='typeResults' onClick={handleTypeResults1}>
                  <h5>Boolean</h5>
                </button>
                <button className='typeResults' onClick={handleTypeResults2}>
                  <h5>Count</h5>
                </button>
                <button className='typeResults' onClick={handleTypeResults3}>
                  <h5>Full response</h5>
                </button>
              </div>

              {show3 && logInRequired === false && !error && (
                <div>
                  <TableResultsVariant
                    show={'full'}
                    results={results}
                    resultsPerDataset={resultsPerDataset}
                    beaconsList={beaconsList}
                    resultSets={props.resultSets}
                  ></TableResultsVariant>
                </div>
              )}

              {show3 && error && <h3>&nbsp; {error} </h3>}

              {show2 && logInRequired === false && !error && (
                <div>
                  <TableResultsVariant
                    show={'count'}
                    resultsPerDataset={resultsPerDataset}
                    resultsNotPerDataset={resultsNotPerDataset}
                    results={results}
                    beaconsList={beaconsList}
                    resultSets={props.resultSets}
                  ></TableResultsVariant>
                </div>
              )}

              {show1 && logInRequired === false && !error && (
                <div className='containerTableResults'>
                  <TableResultsVariant
                    show={'boolean'}
                    resultsPerDataset={resultsPerDataset}
                    resultsNotPerDataset={resultsNotPerDataset}
                    results={results}
                    beaconsList={beaconsList}
                    resultSets={props.resultSets}
                  ></TableResultsVariant>
                </div>
              )}

              {show1 && error && <h3>&nbsp; {error} </h3>}
              {show2 && error && <h3>&nbsp; {error} </h3>}
            </div>
          )}
          {timeOut && error === 'Connection error. Please retry' && (
            <h3>&nbsp; {error} </h3>
          )}
        </div>
      )}
    </div>
  )
}

export default VariantsResults
